import {
  findUserByEmailInFirestore,
  getRegisteredUsersDiagnostic
} from '../server/firestoreUsers';

async function main() {
  console.log('🔍 [PRUEBA DE BASE DE DATOS] Consultando usuarios y correos registrados...');

  const queryArg = process.argv[2];

  if (queryArg) {
    console.log(`🔎 Probando búsqueda flexible para: "${queryArg}"`);
    const found = await findUserByEmailInFirestore(queryArg);
    if (found) {
      console.log('✅ USUARIO ENCONTRADO EXITOSAMENTE:');
      console.log({
        id: found.id,
        email: found.email,
        name: found.name,
        username: found.username,
        role: found.role,
        status: found.status
      });
    } else {
      console.log(`❌ No se encontró ningún usuario con el correo: "${queryArg}"`);
    }
  }

  const diagnostic = await getRegisteredUsersDiagnostic();
  console.log('\n📊 RESUMEN DE USUARIOS EN LA BASE DE DATOS:');
  console.log(`- Colección consultada: "${diagnostic.collection}"`);
  console.log(`- Base de datos ID: "${diagnostic.databaseId}"`);
  console.log(`- Total de usuarios registrados encontrados: ${diagnostic.total}\n`);

  console.log('📋 LISTADO OFICIAL DE USUARIOS Y CORREOS REGISTRADOS:');
  console.table(
    diagnostic.users.map(u => ({
      ID: u.id,
      CORREO: u.email,
      NOMBRE: u.name,
      USUARIO: u.username,
      ROL: u.role,
      ORIGEN: u.source
    }))
  );

  process.exit(0);
}

main().catch(err => {
  console.error('Error ejecutando script de prueba:', err);
  process.exit(1);
});
