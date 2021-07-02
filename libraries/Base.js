const mongoDrive = require("mongodb").MongoClient;

class Base {
   // Definizione costanti:
   server_invalid = "invalid server";
   port_invalid = "invalid port";
   dbname_invalid = "invalid dbname";
   collection_invalid = "invalid collection";
   document_invalid = "invalid document";
   document_key_invalid = "invalid document key";
   not_found = "not found";
   invalid_property = "invalid property";
   already_exists = "already exists";

   // Dichiarazione proprietà private:
   #database = {};

   // Get delle proprietà della connessione:
   get database() {
      return this.#database;
   };

   // Metodi:
   constructor(database = undefined) {
      if(database !== undefined) {
         this.#database = {
            "dbname": database.dbname,
            "server": database.server,
            "port": database.port,
            "client": database.client
         };
      }
   };
   async open(dbname = undefined, server = undefined, port = undefined) {
      // Vengono verificati i parametri di connessione e, se non è stato specificato il riutilizzo di
      // un client, crea una nuova istanza:
      if(dbname === undefined || dbname.length === 0)
         throw this.dbname_invalid;

      if(server === undefined || server.length === 0)
         throw this.server_invalid;

      if(port === 0 || port > 65535)
         throw this.port_invalid;

      // Inizializza proprietà private:
      this.#database = {
         "dbname": dbname,
         "server": server,
         "port": port
      };

      // Apre client:
      this.#database.client = new mongoDrive(`mongodb://${this.#database.server}:${this.#database.port}\\`, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      });

      // Effettua la connessione:
      await this.#database.client.connect();
   };
   async close() {
      // Chiude la connessione che non sarà più possibile utilizzare (tenere in considerazione l'eventuale
      // condivisione dell'oggetto client):
      await this.#database.client.close();
      this.#database.client = undefined;
      this.#database = {};
   };
   async _load(collection, key) {
      // Inizializza proprietà locali:
      let document = [];

      // Controllo parametri:
      if(collection === undefined || collection.length === 0)
         throw this.collection_invalid;

      if(key === undefined || key.length === 0)
         throw this.document_key_invalid;

      // Cerca il documento con la chiave specificata:
      document = await this._find(collection, key);
      if(document.length === 0)
         throw this.not_found;

      // Restituisce documento:
      return document;
   };
   async _save(collection, key, document, upsert = true) {
      // Controlla correttezza dei parametri:
      if(collection === undefined || collection.length === 0)
         throw this.collection_invalid;

      if(key === undefined || key.length === 0)
         throw this.document_key_invalid;

      if(document === undefined)
         throw this.document_invalid;

      // Inserisce o aggiorna documento:
      await this.#database.client.db(this.#database.dbname).collection(collection).findOneAndUpdate(
         { "_id": key },
         { "$set": document },
         { "upsert": true, "returnDocument": "after" }
      );
   };
   async _remove(collection, filter = { }) {
      // Elimina i documenti che rispondono alla chiave specificata:
      await this.#database.client.db(this.#database.dbname).collection(collection).deleteMany(filter);
   };
   async _find(collection, filter = {}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let cursor = undefined;
      let documents = [];

      // Cerca il documento con la chiave specificata:
      cursor = await this.#database.client.db(this.#database.dbname).collection(collection).find(filter, options).sort(sort);

      // Restituisce sempre un'array con i documenti trovati:
      await cursor.forEach(document => {
         documents.push(document);
      });

      // Restituisce lista documento trovati:
      return documents;
   };
   async _getIntervalNextNumber(collection, name = "counter") {
      // Inizializza proprietà locali:
      let id = 0;

      // Incrementa il contatore presente nella collezione specificata. Il contatore è contenuto nel
      // documento con chiave "counter":
      await this.#database.client.db(this.#database.dbname).collection(collection).findOneAndUpdate(
         { "_id": name},
         { "$inc": { "value": 1 } },
         { "upsert": true, "returnDocument": "after" }
      ).then(result => {
         id = result.value.value;
      });

      // Restituisce nuovo contatore:
      return id;
   };
   async _count(collection, filter) {
      // Effettua conteggio in base al filtro:
      return await this.#database.client.db(this.#database.dbname).collection(collection).countDocuments(filter);
   };
   async _openSession(sessionid, userid) {
      // Inizializza proprietà locali:
      let session = {};
      
      // Se non è specificato un id, non genera nulla:
      if(sessionid !== undefined && sessionid !== 0 &&
         userid !== undefined && userid !== 0) {
         session = {
            "_id": sessionid,
            "type": "session",
            "userid": userid,
            "created_at": new Date().toISOString()
         };
         await this.#database.client.db(this.#database.dbname).collection("users").findOneAndUpdate(
            { "_id": sessionid },
            { "$set": session },
            { "upsert": true }
         );
      }
   };
   async _closeSession(id) {
      // Inizializza proprietà locali:
      let documents = [];
      let session = {};

      // Legge la sessione che si vuole chiudere:
      if(id !== undefined && id !== 0) {
         documents = await this._find("users", { "_id": id, "type": "session" });
         if(documents.length === 1) {
            session = documents[0];
            session.closed_at = new Date().toISOString();
            await this.#database.client.db(this.#database.dbname).collection("users").findOneAndUpdate(
               { "_id": id },
               { "$set": session }
            );
         }
      }
   };
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = Base;