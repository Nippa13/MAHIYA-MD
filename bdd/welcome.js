
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

// Cr�ez une pool de connexions PostgreSQL
const pool = new Pool(proConfig);

// Vous pouvez maintenant utiliser 'pool' pour interagir avec votre base de donn�es PostgreSQL.
const creerTableevents = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        Id serial PRIMARY KEY,
        jid text UNIQUE,
        welcome text DEFAULT 'non',
        goodbye text DEFAULT 'non',
        antipromote text DEFAULT 'non',
        antidemote text DEFAULT 'non'
      );
    `);
    console.log("La table 'events' a �t� cr��e avec succ�s.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'events':", e);
  }
};

// Appelez la m�thode pour cr�er la table "banUser"
creerTableevents();



// Fonction pour ajouter un utilisateur � la liste des bannis
async function attribuerUnevaleur(jid, row, valeur) {
    const client = await pool.connect();

    try {
        // V�rifions si le jid existe dans la table
        const result = await client.query('SELECT * FROM events WHERE jid = $1', [jid]);
        
        // V�rifiez la longueur des lignes (rows) pour d�terminer si le jid existe
        const jidExiste = result.rows.length > 0;

        if (jidExiste) {
            // Si le jid existe, mettez � jour la valeur de la colonne sp�cifi�e (row)
            await client.query(`UPDATE events SET ${row} = $1 WHERE jid = $2`, [valeur, jid]);
            console.log(`La colonne ${row} a �t� actualis�e sur ${valeur} pour le jid ${jid}`);
        } else {
            // Si le jid n'existe pas, ajoutez une nouvelle ligne avec le jid et la valeur sp�cifi�s
            await client.query(`INSERT INTO events (jid, ${row}) VALUES ($1, $2)`, [jid, valeur]);
            console.log(`Nouveau jid ${jid} ajout� avec la colonne ${row} ayant la valeur ${valeur}`);
        }
    } catch (error) {
        console.error("Erreur lors de l'actualisation de events :", error);
    } finally {
        client.release();
    }
};


async function recupevents(jid, row) {
     const client = await pool.connect()
    try {
        const result = await client.query('SELECT ' + row + ' FROM events WHERE jid = $1', [jid]);
        const jidExists = result.rows.length > 0;

        if (jidExists) {
            return result.rows[0][row];
        } else {
            return 'non';
        }
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
    }
}



module.exports = {
  attribuerUnevaleur,
  recupevents,
};
