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

// Fonction pour cr�er la table "banGroup"
const creerTableBanGroup = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banGroup (
        groupeJid text PRIMARY KEY
      );
    `);
    console.log("La table 'banGroup' a �t� cr��e avec succ�s.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'banGroup':", e);
  }
};

// Appelez la m�thode pour cr�er la table "banGroup"
creerTableBanGroup();

// Fonction pour ajouter un groupe � la liste des groupes bannis
async function addGroupToBanList(groupeJid) {
  const client = await pool.connect();
  try {
    // Ins�rez le groupe dans la table "banGroup"
    const query = "INSERT INTO banGroup (groupeJid) VALUES ($1)";
    const values = [groupeJid];

    await client.query(query, values);
    console.log(`Groupe JID ${groupeJid} ajout� � la liste des groupes bannis.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du groupe banni :", error);
  } finally {
    client.release();
  }
}

// Fonction pour v�rifier si un groupe est banni
async function isGroupBanned(groupeJid) {
  const client = await pool.connect();
  try {
    // V�rifiez si le groupe existe dans la table "banGroup"
    const query = "SELECT EXISTS (SELECT 1 FROM banGroup WHERE groupeJid = $1)";
    const values = [groupeJid];

    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Erreur lors de la v�rification du groupe banni :", error);
    return false;
  } finally {
    client.release();
  }
}

// Fonction pour supprimer un groupe de la liste des groupes bannis
async function removeGroupFromBanList(groupeJid) {
  const client = await pool.connect();
  try {
    // Supprimez le groupe de la table "banGroup"
    const query = "DELETE FROM banGroup WHERE groupeJid = $1";
    const values = [groupeJid];

    await client.query(query, values);
    console.log(`Groupe JID ${groupeJid} supprim� de la liste des groupes bannis.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du groupe banni :", error);
  } finally {
    client.release();
  }
}

module.exports = {
  addGroupToBanList,
  isGroupBanned,
  removeGroupFromBanList,
};