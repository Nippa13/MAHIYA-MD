require("dotenv").config();
const { Pool } = require("pg");
let s =require("../set")
var dbUrl=s.DATABASE_URL?s.DATABASE_URL:"postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9"

const proConfig = {
  connectionString:dbUrl ,
  ssl: {
    rejectUnauthorized: false,
  },
};

const pool = new Pool(proConfig);


// Fonction pour cr�er la table "antilien"
async function createAntilienTable() {
  const client = await pool.connect();
  try {
    // Ex�cutez une requ�te SQL pour cr�er la table "antilien" si elle n'existe pas d�j�
    await client.query(`
      CREATE TABLE IF NOT EXISTS antilien (
        jid text PRIMARY KEY,
        etat text,
        action text
      );
    `);
    console.log("La table 'antilien' a �t� cr��e avec succ�s.");
  } catch (error) {
    console.error("Une erreur est survenue lors de la cr�ation de la table 'antilien':", error);
  } finally {
    client.release();
  }
}

// Appelez la m�thode pour cr�er la table "antilien"
createAntilienTable();



async function ajouterOuMettreAJourJid(jid, etat) {
  const client = await pool.connect();
  
  try {
    // V�rifiez si le jid existe d�j� dans la table 'antilien'
    const result = await client.query('SELECT * FROM antilien WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;

    if (jidExiste) {
      // Si le jid existe, mettez � jour l'�tat avec la valeur pass�e en argument
      await client.query('UPDATE antilien SET etat = $1 WHERE jid = $2', [etat, jid]);
    } else {
      // Si le jid n'existe pas, ajoutez-le avec l'�tat pass� en argument et l'action 'supp' par d�faut
      await client.query('INSERT INTO antilien (jid, etat, action) VALUES ($1, $2, $3)', [jid, etat, 'supp']);
    }
    
    console.log(`JID ${jid} ajout� ou mis � jour avec succ�s dans la table 'antilien'.`);
  } catch (error) {
    console.error('Erreur lors de l\'ajout ou de la mise � jour du JID dans la table ,', error);
  } finally {
    client.release();
  }
};


async function mettreAJourAction(jid, action) {
  const client = await pool.connect();
  
  try {
    // V�rifiez si le jid existe d�j� dans la table 'antilien'
    const result = await client.query('SELECT * FROM antilien WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;

    if (jidExiste) {
      // Si le jid existe, mettez � jour l'action avec la valeur fournie (et laissez l'�tat inchang�)
      await client.query('UPDATE antilien SET action = $1 WHERE jid = $2', [action, jid]);
    } else {
      // Si le jid n'existe pas, ajoutez-le avec l'�tat 'non' par d�faut et l'action fournie
      await client.query('INSERT INTO antilien (jid, etat, action) VALUES ($1, $2, $3)', [jid, 'non', action]);
    }
    
    console.log(`Action mise � jour avec succ�s pour le JID ${jid} dans la table 'antilien'.`);
  } catch (error) {
    console.error('Erreur lors de la mise � jour de l\'action pour le JID dans la table  :', error);
  } finally {
    client.release();
  }
};
  


async function verifierEtatJid(jid) {
  const client = await pool.connect();

  try {
    // Recherchez le JID dans la table 'antilien' et r�cup�rez son �tat
    const result = await client.query('SELECT etat FROM antilien WHERE jid = $1', [jid]);
    
    if (result.rows.length > 0) {
      const etat = result.rows[0].etat;
      return etat === 'oui';
    } else {
      // Si le JID n'existe pas dans la table, il n'est pas enregistr� comme "oui"
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la v�rification de l\'�tat du JID dans la table ', error);
    return false;
  } finally {
    client.release();
  }
};

async function recupererActionJid(jid) {
  const client = await pool.connect();

  try {
    // Recherchez le JID dans la table 'antilien' et r�cup�rez son action
    const result = await client.query('SELECT action FROM antilien WHERE jid = $1', [jid]);
    
    if (result.rows.length > 0) {
      const action = result.rows[0].action;
      return action;
    } else {
      // Si le JID n'existe pas dans la table, retournez une valeur par d�faut (par exemple, 'supp')
      return 'supp';
    }
  } catch (error) {
    console.error('Erreur lors de la r�cup�ration de l\'action du JID dans la table :', error);
    return 'supp'; // Gestion de l'erreur en retournant une valeur par d�faut
  } finally {
    client.release();
  }
};





module.exports = {
  mettreAJourAction,
  ajouterOuMettreAJourJid,
  verifierEtatJid,
  recupererActionJid,
};