const { writeFile } = require('fs');
const { promisify } = require('util');
const dotenv = require('dotenv');

// Carga las variables del archivo .env
dotenv.config();

const writeFilePromisified = promisify(writeFile);

const targetPath = './src/app/environments/environment.ts';

// Contenido del archivo que se generará
const envConfigFile = `export const environment = {
  production: ${process.env['PRODUCTION'] || 'false'},
  url: '${process.env['BACKEND_URL'] || 'http://localhost:8080/api/v1'}'
};
`;

(async () => {
  try {
    await writeFilePromisified(targetPath, envConfigFile);
    console.log(`Archivo generado exitosamente en ${targetPath}`);
  } catch (err) {
    console.error('Error al generar el archivo de entorno:', err);
    process.exit(1);
  }
})();
