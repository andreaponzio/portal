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
   #dbname = undefined;
   #server = undefined;
   #port = undefined;
   #client = undefined;

   constructor(client = undefined) {
      // Permette di riutilizzare un client, quindi non è necessario effettuare la chiamata
      // al metodo open:
      if(client !== undefined)
         this.#client = client;
   };
   async open(dbname = undefined, server = undefined, port = undefined) {
      // Vengono verificati i parametri di connessione e, se non è stato specificato il riutilizzo di
      // un client, ne crea una nuova istanza:
      if(this.#client === undefined) {

         // Controlla parametri:
         if(dbname === undefined || dbname.length === 0)
            throw this.dbname_invalid;

         if(server === undefined || server.length === 0)
            throw this.server_invalid;

         if(port === 0 || port > 65535)
            throw this.port_invalid;

         // Inizializza proprietà private:
         this.#dbname = dbname;
         this.#server = server;
         this.#port = port;

         // Apre client:
         this.#client = new mongoDrive(`mongodb://${this.#server}:${this.#port}\\`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
         });

         // Effettua la connessione:
         await this.#client.connect();
      }
   };
   async close() {
      // Chiude la connessione che non sarà più possibile utilizzare (tenere in considerazione l'eventuale
      // condivisione dell'oggetto client):
      await this.#client.close();
      this.#client = undefined;
   };
   get client() {
      return this.#client;
   };
   async _load(collection, key) {
      // Inizializza proprietà locali:
      let document = undefined;

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
      await this.#client.db(this.#dbname).collection(collection).findOneAndUpdate(
         { "_id": key },
         { "$set": document },
         { "upsert": true, "returnDocument": "after" }
      );
   };
   async _remove(collection, filter = { }) {
      // Elimina i documenti che rispondono alla chiave specificata:
      await this.#client.db(this.#dbname).collection(collection).deleteMany(filter);
   };
   async _find(collection, filter = {}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let cursor = undefined;
      let documents = [];

      // Cerca il documento con la chiave specificata:
      cursor = await this.#client.db(this.#dbname).collection(collection).find(filter, options).sort(sort);

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
      await this.#client.db(this.#dbname).collection(collection).findOneAndUpdate(
         { "_id": name},
         { "$inc": { "value": 1 } },
         { "upsert": true, "returnDocument": "after" }
      ).then(result => {
         id = result.value.value;
      });

      // Restituisce nuovo contatore:
      return id;
   };
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = Base;