
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

// Fonction pour cr�er la table "alive" avec une colonne "id"
const creerTableAlive = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS alive (
          id serial PRIMARY KEY,
          message text,
          lien text
        );
      `);
      console.log("La table 'alive' a �t� cr��e avec succ�s.");
    } catch (e) {
      console.error("Une erreur est survenue lors de la cr�ation de la table 'alive':", e);
    }
  };
  
  // Appelez la m�thode pour cr�er la table "alive"
  creerTableAlive();

// Fonction pour ajouter ou mettre � jour un enregistrement dans la table "alive"
async function addOrUpdateDataInAlive(message, lien) {
    const client = await pool.connect();
    try {
      // Ins�rez ou mettez � jour les donn�es dans la table "alive"
      const query = `
        INSERT INTO alive (id, message, lien)
        VALUES (1, $1, $2)
        ON CONFLICT (id)
        DO UPDATE SET message = excluded.message, lien = excluded.lien;
      `;
      const values = [message, lien];
  
      await client.query(query, values);
      console.log("Donn�es ajout�es ou mises � jour dans la table 'alive' avec succ�s.");
    } catch (error) {
      console.error("Erreur lors de l'ajout ou de la mise � jour des donn�es dans la table 'alive':", error);
    } finally {
      client.release();
    }
  };

 
  async function getDataFromAlive() {
    const client = await pool.connect();
    try {
      // Ex�cutez la requ�te SELECT pour r�cup�rer les donn�es
      const query = "SELECT message, lien FROM alive WHERE id = 1";
      const result = await client.query(query);
  
      if (result.rows.length > 0) {
        const { message, lien } = result.rows[0];
        return { message, lien };
      } else {
        console.log("Aucune donn�e trouv�e dans la table 'alive'.");
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la r�cup�ration des donn�es depuis la table 'alive':", error);
      return null;
    } finally {
      client.release();
    }
  };
  
  
  

  module.exports = {
    addOrUpdateDataInAlive,
    getDataFromAlive,
    
  };
