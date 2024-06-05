// Importez dotenv et chargez les variables d'environnement depuis le fichier .env
require("dotenv").config();


const { Pool } = require("pg");

// Utilisez le module 'set' pour obtenir la valeur de DATABASE_URL depuis vos configurations
const s = require("../set");

// R�cup�rez l'URL de la base de donn�es de la variable s.DATABASE_URL
const dbUrl = s.DATABASE_URL?s.DATABASE_URL:"postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9" ;
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};

// Cr�ez une pool de connexions PostgreSQL
const pool = new Pool(proConfig);

async function createUsersRankTable() {
  const client = await pool.connect();

  try {
    // Cr�ez la table users_rank si elle n'existe pas d�j�
    await client.query(`
      CREATE TABLE IF NOT EXISTS users_rank (
        id SERIAL PRIMARY KEY,
        jid VARCHAR(255) UNIQUE,
        xp INTEGER DEFAULT 0,
        messages INTEGER DEFAULT 0
      );
    `);
  } catch (error) {
    console.error('Erreur lors de la cr�ation de la table users_rank:', error);
  } finally {
    client.release();
  }
}

async function ajouterOuMettreAJourUserData(jid) {
  const client = await pool.connect();

  try {
    // V�rifiez si le JID existe d�j� dans la table 'users_rank'
    const result = await client.query('SELECT * FROM users_rank WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;

    if (jidExiste) {
      // Si le JID existe, mettez � jour XP (+10) et messages (+1)
      await client.query('UPDATE users_rank SET xp = xp + 10, messages = messages + 1 WHERE jid = $1', [jid]);
    } else {
      // Si le JID n'existe pas, ajoutez-le avec XP = 10 et messages = 1
      await client.query('INSERT INTO users_rank (jid, xp, messages) VALUES ($1, $2, $3)', [jid, 10, 1]);
    }

  } catch (error) {
    console.error('Erreur lors de la mise � jour des donn�es de l\'utilisateur:', error);
  } finally {
    client.release();
  }
};

async function getMessagesAndXPByJID(jid) {
  const client = await pool.connect();

  try {
    // S�lectionnez le nombre de messages et d'XP pour le JID donn�
    const query = 'SELECT messages, xp FROM users_rank WHERE jid = $1';
    const result = await client.query(query, [jid]);

    if (result.rows.length > 0) {
      // Retournez les valeurs de messages et d'XP
      const { messages, xp } = result.rows[0];
      return { messages, xp };
    } else {
      // Si le JID n'existe pas, renvoyez des valeurs par d�faut (0 messages et 0 XP)
      return { messages: 0, xp: 0 };
    }
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration des donn�es de l\'utilisateur:', error);
    return { messages: 0, xp: 0 }; // En cas d'erreur, renvoyez des valeurs par d�faut
  } finally {
    client.release();
  }
}

async function getBottom10Users() {
  const client = await pool.connect();

  try {
    // S�lectionnez les 10 premiers utilisateurs class�s par XP de mani�re ascendante (du plus bas au plus �lev�)
    const query = 'SELECT jid, xp , messages FROM users_rank ORDER BY xp DESC LIMIT 10';
    const result = await client.query(query);

    // Retournez le tableau des utilisateurs
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration du bottom 10 des utilisateurs:', error);
    return []; // En cas d'erreur, renvoyez un tableau vide
  } finally {
    client.release();
  }
}



// Ex�cutez la fonction de cr�ation de la table lors de l'initialisation
createUsersRankTable();

module.exports = {
  ajouterOuMettreAJourUserData,
  getMessagesAndXPByJID,
  getBottom10Users,
};