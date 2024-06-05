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

async function creerTableStickcmd() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stickcmd (
        cmd text PRIMARY KEY,
        id text NOT NULL
      );
    `);
    console.log("La table 'stickcmd' a �t� cr��e avec succ�s.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'stickcmd':", e);
  }
}

creerTableStickcmd();

async function addstickcmd(cmd, id) {
  let client;
  try {
    client = await pool.connect();
    const query = "INSERT INTO stickcmd(cmd, id) VALUES ($1, $2)";
    const values = [cmd, id];
    await client.query(query, values);
  } catch (error) {
    console.log('Erreur lors de l\'ajout du stickcmd', error);
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function inStickCmd(id) {
  let client;
  try {
    client = await pool.connect();
    const query = "SELECT  EXISTS (SELECT 1 FROM stickcmd WHERE id = $1)";
    const values = [id];
    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function deleteCmd(cmd) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM stickcmd WHERE cmd = $1";
    const values = [cmd];
    await client.query(query, values);
    console.log(`Le stickcmd ${cmd} a �t� supprim� de la liste.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du stickcmd :", error);
  } finally {
    client.release();
  }
} ;

async function getCmdById(id) {
    let client;
    try {
      client = await pool.connect();
      const query = "SELECT cmd FROM stickcmd WHERE id = $1";
      const values = [id];
      const result = await client.query(query, values);
  
      if (result.rows.length > 0) {
        return result.rows[0].cmd;
      } else {
        return null; // Ajustez la valeur de retour en cons�quence si l'id n'est pas trouv�.
      }
    } catch (error) {
      console.error("Erreur lors de la r�cup�ration du stickcmd par id :", error);
      return null; // G�rer l'erreur et ajuster la valeur de retour si n�cessaire.
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  async function getAllStickCmds() {

    const client = await pool.connect();
    try {
        
        const query = "SELECT cmd FROM stickcmd";
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error("Erreur lors de la r�cup�ration de toutes les commandes stickcmd :", error);
        return [];
    } finally {
        client.release();
    }
} ;

  

  
  
  module.exports = {

     addstickcmd,
     deleteCmd,
     getCmdById,
     inStickCmd,
     getAllStickCmds,
  }