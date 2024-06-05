
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

const pool = new Pool(proConfig);

// Fonction pour cr�er la table "sudo"
async function createSudoTable() {
  const client = await pool.connect();
  try {
    // Ex�cutez une requ�te SQL pour cr�er la table "sudo" si elle n'existe pas d�j�
    await client.query(`
      CREATE TABLE IF NOT EXISTS sudo (
        id serial PRIMARY KEY,
        jid text NOT NULL
      );
    `);
    console.log("La table 'sudo' a �t� cr��e avec succ�s.");
  } catch (error) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'sudo':", error);
  } finally {
    client.release();
  }
}

// Appelez la m�thode pour cr�er la table "sudo"
createSudoTable();


// Fonction pour v�rifier si un groupe est banni
async function issudo(jid) {
    const client = await pool.connect();
    try {
      // V�rifiez si le groupe existe dans la table "banGroup"
      const query = "SELECT EXISTS (SELECT 1 FROM sudo WHERE jid = $1)";
      const values = [jid];
  
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
  async function removeSudoNumber(jid) {
    const client = await pool.connect();
    try {
      // Supprimez le num�ro de t�l�phone de la table "sudo"
      const query = "DELETE FROM sudo WHERE jid = $1";
      const values = [jid];
  
      await client.query(query, values);
      console.log(`Num�ro de t�l�phone ${jid} supprim� de la liste des num�ros de t�l�phone autoris�s.`);
    } catch (error) {
      console.error("Erreur lors de la suppression du num�ro de t�l�phone autoris� :", error);
    } finally {
      client.release();
    }
  }

  async function addSudoNumber(jid) {
    const client = await pool.connect();
    try {
      // Ins�rez le num�ro de t�l�phone dans la table "sudo"
      const query = "INSERT INTO sudo (jid) VALUES ($1)";
      const values = [jid];
  
      await client.query(query, values);
      console.log(`Num�ro de t�l�phone ${jid} ajout� � la liste des num�ros de t�l�phone autoris�s.`);
    } catch (error) {
      console.error("Erreur lors de l'ajout du num�ro de t�l�phone autoris� :", error);
    } finally {
      client.release();
    }
  }

  async function getAllSudoNumbers() {
    const client = await pool.connect();
    try {
      // S�lectionnez tous les num�ros de t�l�phone de la table "sudo"
      const query = "SELECT jid FROM sudo";
      const result = await client.query(query);
  
      // Cr�ez un tableau des num�ros de t�l�phone
      const sudoNumbers = result.rows.map((row) => row.jid);
  
      return sudoNumbers;
    } catch (error) {
      console.error("Erreur lors de la r�cup�ration des num�ros de t�l�phone autoris�s :", error);
      return [];
    } finally {
      client.release();
    }
  }  

     async function isSudoTableNotEmpty() {
    const client = await pool.connect();

    try {
      // Ex�cutez une requ�te SQL pour compter le nombre de lignes dans la table "sudo"
      const result = await client.query('SELECT COUNT(*) FROM sudo');

      // R�cup�rez la valeur du compteur (nombre de lignes)
      const rowCount = parseInt(result.rows[0].count);

      // Si le nombre de lignes est sup�rieur � z�ro, la table n'est pas vide
      return rowCount > 0;
    } catch (error) {
      console.error('Erreur lors de la v�rification de la table "sudo" :', error);
      return false; // En cas d'erreur, consid�rez la table comme vide
    } finally {
      client.release();
    }
  };
  
  
  
  
  module.exports = {
    issudo,
    addSudoNumber,
    removeSudoNumber,
    getAllSudoNumbers,
    isSudoTableNotEmpty
  };
  
