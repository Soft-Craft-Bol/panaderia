import { execSync } from "child_process";

const SERVER = "145.223.92.183";
const USER = "root";
const DEST = "/var/www/inpasep/html";

try {
  console.log("📤 Subiendo archivos al servidor...");
  execSync(`sshpass -p "Minipelaez123@" scp -r dist/* ${USER}@${SERVER}:${DEST}`, { stdio: "inherit" });

  console.log("✅ Despliegue completado correctamente!");
} catch (error) {
  console.error("❌ Error durante el despliegue:", error.message);
  process.exit(1);
}
