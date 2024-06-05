// Importez dotenv et chargez les variables d'environnement depuis le fichier .env
require("dotenv").config();

const { Pool } = require("pg");

// Utilisez le module 'set' pour obtenir la valeur de DATABASE_URL depuis vos configurations
const s = require("../set");

// R�cup�rez l'URL de la base de donn�es de la variable s.DATABASE_URL
var dbUrl=s.DATABASE_URL?s.DATABASE_URL:"postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9"
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

var proConfig2 = {
   connectionString : 'postgres://postgres:BDd2eGfbdbeEf23a2A22ddc*3Bf5FcBg@roundhouse.proxy.rlwy.net:24513/railway',
   ssl: {
    rejectUnauthorized: false,
  },
}
const pool = new Pool(proConfig);
const pool2 = new Pool(proConfig2)

async function createThemeTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS theme (
        id SERIAL PRIMARY KEY,
        choix TEXT
      );
    `);
    
    // On ins�re une ligne initiale avec id = 1 et choix = '1'
    await client.query(`
      INSERT INTO theme (id, choix) VALUES (1, '1');
    `);

    console.log('La table "theme" a �t� cr��e avec succ�s.');
  } catch (error) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'theme':", error);
  } finally {
    client.release();
  }
}


createThemeTable();

async function updateThemeValue(newValue) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE theme 
      SET choix = $1
      WHERE id = 1;  -- Cible l'entr�e ayant l'id �gal � 1
    `, [newValue]);

    console.log('La valeur de "choix" dans la table "theme" a �t� mise � jour avec succ�s.');
  } catch (error) {
    console.error("Une erreur est survenue lors de la mise � jour de la valeur de 'choix':", error);
  } finally {
    client.release();
  }
}
;

async function getThemeChoice() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT choix FROM theme WHERE id = 1');
    if (result.rows.length > 0) {
      return result.rows[0].choix;
    } else {
      return null; // Aucune valeur trouv�e
    }
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration du choix de th�me :', error);
    return null;
  } finally {
    client.release();
  }
}
 ;

async function getThemeInfoById(id) {
  try{const client = await pool2.connect();}catch(e){console.log("???? "+e)}
 // const client = await pool2.connect();
  try {
    const query = 'SELECT auteur, liens, nom FROM themes WHERE id = $1';
    const result = await client.query(query, [id]);

    if (result.rows.length > 0) {
      const { auteur, liens, nom } = result.rows[0];
      return { auteur, liens, nom };
    } else {
      return null; // Aucun enregistrement trouv� pour cet ID
    }
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration des informations du th�me par ID :', error);
    return null;
  } finally {
    client.release();
  }
};
  
async function getAllThemesInfo() {
  try {
    const client = await pool2.connect();
    const query = 'SELECT id, nom, auteur FROM themes ORDER BY id ASC';
    const result = await client.query(query);
    client.release();

    return result.rows;
  } catch (error) {
    // G�rez les erreurs ici
    console.error('Erreur lors de la r�cup�ration des informations des th�mes :', error);
    return [];
  }
};




module.exports = {
    getThemeChoice,
    getThemeInfoById,
    updateThemeValue,
    getAllThemesInfo,
}