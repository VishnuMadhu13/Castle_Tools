// =====================================================================
//  Castle Tools (WebCastle Tools / credvault) — End-to-End CI/CD
//  Next.js 16 + TypeScript + Bun + Drizzle ORM + PostgreSQL
//
//  SAST       : SonarQube (+ Quality Gate) + Semgrep
//  Dependency : bun audit + Trivy FS (secrets / misconfig / vulns)
//  Image Scan : Trivy image
//  DAST       : OWASP ZAP baseline against the running container + Postgres
//  Delivery   : Docker Hub push, archived artifacts, GitOps manifest update
// =====================================================================

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
    }

    // ------------------------------------------------------------------
    //  PIPELINE SETUP
    // ------------------------------------------------------------------
    environment {
        APP_NAME        = 'castle-tools'
        APP_DIR         = 'webcastle-tools-main'             // Next.js app folder in the repo
        APP_PORT        = '3000'
        DOCKERHUB_USER  = 'vishnumadhu13'
        IMAGE           = "${DOCKERHUB_USER}/${APP_NAME}"
        TAG             = "${BUILD_NUMBER}"
        GITHUB_REPO     = 'github.com/VishnuMadhu13/Castle_Tools.git'
        GIT_BRANCH_NAME = 'main'
        MANIFEST_FILE   = 'k8s/deployment.yaml'

        // Jenkins credential / tool IDs
        DOCKERHUB_CREDS = 'docker-cred'
        GITHUB_CREDS    = 'github-jenkins'
        SONAR_SERVER    = 'sonarqube'
        SONAR_SCANNER   = 'sonar-scanner'

        // Tool versions (installed into the workspace, cached between builds)
        NODE_VERSION    = '22.11.0'
        BUN_VERSION     = '1.2.23'
        TRIVY_VERSION   = '0.69.3'

        TOOLS           = "${WORKSPACE}/.tools"
        REPORT_DIR      = "${WORKSPACE}/reports"
        PATH            = "${WORKSPACE}/.tools/node/bin:${WORKSPACE}/.tools/bun/bin:${WORKSPACE}/.tools/bin:${WORKSPACE}/.tools/venv/bin:${PATH}"
        NEXT_TELEMETRY_DISABLED = '1'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def msg = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                    if (msg.contains('[skip ci]')) {
                        currentBuild.result = 'NOT_BUILT'
                        error('Manifest-only commit from Jenkins — skipping build.')
                    }
                }
                sh '''
                    rm -rf "$REPORT_DIR" && mkdir -p "$REPORT_DIR" "$TOOLS/bin"
                    git log -1 --pretty=format:"%h - %an : %s" > "$REPORT_DIR/commit-info.txt"
                '''
            }
        }

        stage('Setup Tools') {
            steps {
                sh '''
                    # Node.js
                    if [ ! -x "$TOOLS/node/bin/node" ]; then
                        curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" \
                          | tar -xz -C "$TOOLS"
                        mv "$TOOLS/node-v${NODE_VERSION}-linux-x64" "$TOOLS/node"
                    fi

                    # Bun (project uses bun.lock)
                    if [ ! -x "$TOOLS/bun/bin/bun" ]; then
                        npm install -g "bun@${BUN_VERSION}" --prefix "$TOOLS/bun"
                    fi

                    # Trivy — direct release download + SHA256 check
                    if [ ! -x "$TOOLS/bin/trivy" ]; then
                        TV="$TRIVY_VERSION"
                        BASE="https://github.com/aquasecurity/trivy/releases/download/v${TV}"
                        cd "$TOOLS"
                        curl -fSL -o trivy.tgz  "${BASE}/trivy_${TV}_Linux-64bit.tar.gz"
                        curl -fSL -o trivy.sums "${BASE}/trivy_${TV}_checksums.txt"
                        EXPECTED=$(grep "trivy_${TV}_Linux-64bit.tar.gz" trivy.sums | awk '{print $1}')
                        ACTUAL=$(sha256sum trivy.tgz | awk '{print $1}')
                        [ "$EXPECTED" = "$ACTUAL" ] || { echo "Trivy checksum mismatch"; exit 1; }
                        tar -xzf trivy.tgz -C "$TOOLS/bin" trivy
                        rm -f trivy.tgz trivy.sums
                        cd "$WORKSPACE"
                    fi

                    # Semgrep (Python venv)
                    if [ ! -x "$TOOLS/venv/bin/semgrep" ]; then
                        python3 -m venv "$TOOLS/venv"
                        "$TOOLS/venv/bin/pip" install -q --upgrade pip semgrep
                    fi

                    node -v; bun --version; trivy --version | head -1; semgrep --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${APP_DIR}") {
                    sh 'bun install --frozen-lockfile'
                }
            }
        }

        stage('Type Check') {
            steps {
                dir("${APP_DIR}") {
                    sh '''
                        rc=0
                        node_modules/.bin/tsc --noEmit > "$REPORT_DIR/typecheck.txt" 2>&1 || rc=$?
                        [ -s "$REPORT_DIR/typecheck.txt" ] || echo "No type errors" > "$REPORT_DIR/typecheck.txt"
                        cat "$REPORT_DIR/typecheck.txt"
                        exit $rc
                    '''
                }
            }
        }

        // ================= SAST =================
        stage('SAST - SonarQube') {
            steps {
                script {
                    def scannerHome = tool "${SONAR_SCANNER}"
                    withSonarQubeEnv("${SONAR_SERVER}") {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=${APP_NAME} \
                              -Dsonar.projectName=${APP_NAME} \
                              -Dsonar.projectBaseDir=${APP_DIR} \
                              -Dsonar.sources=. \
                              -Dsonar.exclusions=node_modules/**,.next/**,docs/**,db/migrations/meta/**,**/*.d.ts \
                              -Dsonar.typescript.tsconfigPaths=tsconfig.json
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('SAST - Semgrep') {
            steps {
                dir("${APP_DIR}") {
                    sh '''
                        semgrep scan --metrics=off \
                          --config p/typescript --config p/react --config p/javascript \
                          --config p/secrets --config p/owasp-top-ten \
                          --exclude node_modules --exclude .next \
                          --text-output "$REPORT_DIR/semgrep.txt" \
                          --json-output "$REPORT_DIR/semgrep.json" || true
                    '''
                }
            }
        }

        // ============ DEPENDENCY SCAN ============
        stage('Dependency Scan') {
            parallel {
                stage('bun audit') {
                    steps {
                        dir("${APP_DIR}") {
                            sh '''
                                bun audit        > "$REPORT_DIR/bun-audit.txt"  2>&1 || true
                                bun audit --json > "$REPORT_DIR/bun-audit.json" 2>/dev/null || true
                                tail -3 "$REPORT_DIR/bun-audit.txt"
                            '''
                        }
                    }
                }
                stage('Trivy FS') {
                    steps {
                        sh '''
                            trivy fs --scanners vuln,secret,misconfig \
                              --skip-dirs "$APP_DIR/node_modules,$APP_DIR/.next,.tools,reports" \
                              --severity HIGH,CRITICAL \
                              --format table -o "$REPORT_DIR/trivy-fs.txt" . || true
                        '''
                    }
                }
            }
        }

        // ============ BUILD & IMAGE SCAN ============
        stage('Docker Build') {
            steps {
                dir("${APP_DIR}") {
                    sh 'docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .'
                }
            }
        }

        stage('Image Scan - Trivy') {
            steps {
                sh '''
                    trivy image --severity HIGH,CRITICAL --timeout 10m \
                      --format table -o "$REPORT_DIR/trivy-image.txt" "$IMAGE:$TAG" || true
                '''
            }
        }

        // ================= DAST =================
        stage('DAST - OWASP ZAP') {
            steps {
                sh '''
                    NET=dast-net-${BUILD_NUMBER}
                    PG=castle-pg-${BUILD_NUMBER}
                    APP=castle-app-${BUILD_NUMBER}
                    ZAP=zap-${BUILD_NUMBER}
                    DB_URL="postgresql://credvault:credvault@${PG}:5432/credvault"
                    ENC_KEY=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \\n')
                    AUTH_SEC=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \\n')

                    docker network create "$NET"

                    # 1. Throwaway Postgres
                    docker run -d --name "$PG" --network "$NET" \
                      -e POSTGRES_USER=credvault -e POSTGRES_PASSWORD=credvault -e POSTGRES_DB=credvault \
                      postgres:17-alpine
                    for i in $(seq 1 30); do
                        docker exec "$PG" pg_isready -U credvault -d credvault && break
                        sleep 2
                    done

                    # 2. Run Drizzle migrations using the built image (node db/migrate.mjs)
                    docker run --rm --network "$NET" -e DATABASE_URL="$DB_URL" \
                      "$IMAGE:$TAG" node db/migrate.mjs

                    # 3. Start the app with dummy (non-production) secrets
                    docker run -d --name "$APP" --network "$NET" \
                      -e DATABASE_URL="$DB_URL" \
                      -e AUTH_SECRET="$AUTH_SEC" -e NEXTAUTH_SECRET="$AUTH_SEC" \
                      -e AUTH_TRUST_HOST=true -e NEXTAUTH_URL="http://${APP}:${APP_PORT}" \
                      -e GOOGLE_CLIENT_ID=dast-dummy -e GOOGLE_CLIENT_SECRET=dast-dummy \
                      -e CREDENTIAL_ENCRYPTION_KEY="$ENC_KEY" \
                      "$IMAGE:$TAG"

                    for i in $(seq 1 30); do
                        docker run --rm --network "$NET" curlimages/curl:8.10.1 \
                          -s -o /dev/null -w "%{http_code}\\n" "http://${APP}:${APP_PORT}/" && break
                        sleep 3
                    done
                    docker logs --tail 20 "$APP"

                    # 4. ZAP baseline — no bind mount (Jenkins runs in a container); copy reports out
                    docker run --name "$ZAP" --network "$NET" -u root \
                      --entrypoint sh ghcr.io/zaproxy/zaproxy:stable -c "
                        mkdir -p /zap/wrk && cd /zap/wrk &&
                        zap-baseline.py -t http://${APP}:${APP_PORT} \
                          -r zap-report.html -J zap-report.json -w zap-report.md -I ; exit 0"

                    docker cp "$ZAP":/zap/wrk/. "$REPORT_DIR/"
                    ls -l "$REPORT_DIR"/zap-report.*
                '''
            }
            post {
                always {
                    sh '''
                        docker rm -f castle-app-${BUILD_NUMBER} castle-pg-${BUILD_NUMBER} zap-${BUILD_NUMBER} 2>/dev/null || true
                        docker network rm dast-net-${BUILD_NUMBER} 2>/dev/null || true
                    '''
                }
            }
        }

        // ============ ARTIFACT GENERATION ============
        stage('Generate Artifacts') {
            steps {
                sh '''
                    R="$REPORT_DIR/security-report.txt"
                    {
                      echo "=================================================="
                      echo " SECURITY REPORT : $APP_NAME | Build #$BUILD_NUMBER"
                      echo " Image           : $IMAGE:$TAG"
                      echo " Commit          : $(cat "$REPORT_DIR/commit-info.txt")"
                      echo " Date            : $(date)"
                      echo "=================================================="
                      for f in typecheck.txt semgrep.txt bun-audit.txt trivy-fs.txt trivy-image.txt zap-report.md; do
                        echo ""; echo "########## $f ##########"
                        [ -f "$REPORT_DIR/$f" ] && cat "$REPORT_DIR/$f" || echo "(not generated)"
                      done
                    } > "$R"

                    {
                      echo "app=$APP_NAME"
                      echo "image=$IMAGE:$TAG"
                      echo "digest=$(docker inspect --format '{{.Id}}' "$IMAGE:$TAG")"
                      echo "build=$BUILD_NUMBER"
                    } > "$REPORT_DIR/build-info.txt"

                    tar --exclude=node_modules --exclude=.next --exclude=.git \
                        -czf "$REPORT_DIR/${APP_NAME}-${TAG}-source.tar.gz" "$APP_DIR" k8s Jenkinsfile
                '''
                archiveArtifacts artifacts: 'reports/**', fingerprint: true
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDS}",
                                 usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker push "$IMAGE:$TAG"
                        docker push "$IMAGE:latest"
                        docker logout
                    '''
                }
            }
        }

        // ============ GITOPS MANIFEST UPDATE ============
        stage('Update K8s Manifest') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${GITHUB_CREDS}",
                                 usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        git config user.name  "jenkins"
                        git config user.email "jenkins@ci.local"
                        git fetch origin "$GIT_BRANCH_NAME"
                        git checkout -B "$GIT_BRANCH_NAME" "origin/$GIT_BRANCH_NAME"

                        # Updates both the app container and the db-migrate initContainer
                        sed -i -E "s|image: .*/${APP_NAME}:.*|image: ${IMAGE}:${TAG}|" "$MANIFEST_FILE"
                        grep -n "image:" "$MANIFEST_FILE"

                        git add "$MANIFEST_FILE"
                        git commit -m "ci: update ${APP_NAME} image to ${TAG} [skip ci]" || echo "No change"
                        git push "https://${GIT_USER}:${GIT_TOKEN}@${GITHUB_REPO}" "$GIT_BRANCH_NAME"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS: ${IMAGE}:${TAG} pushed, reports archived, ${MANIFEST_FILE} updated for ArgoCD."
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
        always {
            sh '''
                # Image is already on Docker Hub — free local disk (EC2 volume is small)
                docker rmi "$IMAGE:$TAG" "$IMAGE:latest" 2>/dev/null || true
                docker image prune -f || true
                docker builder prune -f --filter "until=24h" || true
                rm -rf "$WORKSPACE/$APP_DIR/.next" "$WORKSPACE/$APP_DIR/.scannerwork"
                df -h / | tail -1
            '''
        }
    }
}
