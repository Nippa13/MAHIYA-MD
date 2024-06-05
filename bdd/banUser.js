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
const creerTableBanUser = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banUser (
        jid text PRIMARY KEY
      );
    `);
    console.log("La table 'banUser' a �t� cr��e avec succ�s.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'banUser':", e);
  }
};

// Appelez la m�thode pour cr�er la table "banUser"
creerTableBanUser();



// Fonction pour ajouter un utilisateur � la liste des bannis
async function addUserToBanList(jid) {
  const client = await pool.connect();
  try {
    // Ins�rez l'utilisateur dans la table "banUser"
    const query = "INSERT INTO banUser (jid) VALUES ($1)";
    const values = [jid];

    await client.query(query, values);
    console.log(`JID ${jid} ajout� � la liste des bannis.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur banni :", error);
  } finally {
    client.release();
  }
}



// Fonction pour v�rifier si un utilisateur est banni
async function isUserBanned(jid) {
  const client = await pool.connect();
  try {
    // V�rifiez si l'utilisateur existe dans la table "banUser"
    const query = "SELECT EXISTS (SELECT 1 FROM banUser WHERE jid = $1)";
    const values = [jid];

    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Erreur lors de la v�rification de l'utilisateur banni :", error);
    return false;
  } finally {
    client.release();
  }
}

// Fonction pour supprimer un utilisateur de la liste des bannis
async function removeUserFromBanList(jid) {
  const client = await pool.connect();
  try {
    // Supprimez l'utilisateur de la table "banUser"
    const query = "DELETE FROM banUser WHERE jid = $1";
    const values = [jid];

    await client.query(query, values);
    console.log(`JID ${jid} supprim� de la liste des bannis.`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur banni :", error);
  } finally {
    client.release();
  }
}

module.exports = {
  addUserToBanList,
  isUserBanned,
  removeUserFromBanList,
};