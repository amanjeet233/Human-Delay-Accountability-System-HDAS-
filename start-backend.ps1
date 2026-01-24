 # Start HDAS Backend
cd "d:\CU\SEM 6\pr 2.0\HUMAN DELAY ACCOUNTABILITY SYSTEM2\backend"
Write-Host "Building HDAS Backend..." -ForegroundColor Green
mvn clean package -DskipTests
Write-Host "Starting HDAS Backend with Java 21 on port 8081..." -ForegroundColor Green
java -jar "target\human-delay-accountability-system-1.0.0.jar" --spring.profiles.active=dev --server.port=8081
