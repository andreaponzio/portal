const Base = require("../libraries/Base");

class Application extends Base {
   // Dichiarazione proprietà private:
   #application = {};

   // Costruttore della classe Application:
   constructor(database = undefined) {
      super(database);
   };

   // Get delle proprietà dell'applicazione:
   get name() {
      return this.#application.name;
   };
   get title() {
      return this.#application.title;
   };
   get description() {
      return this.#application.description;
   };
   get image() {
      return this.#application.image;
   };
   get sortid() {
      return this.#application.sortid;
   };
   get locked() {
      return this.#application.locked;
   };
   get created_at() {
      return this.#application.created_at;
   };
   get changed_at() {
      return this.#application.changed_at;
   };

   // Set delle proprietà dell'applicazione:
   set title(value) {
      this.#application.title = value || undefined;
   };
   set description(value) {
      this.#application.description = value || undefined;
   };
   set image(value) {
      this.#application.image = value || undefined;
   };
   set sortid(value) {
      this.#application.sortid = value || undefined;
   };
   set locked(value) {
      this.#application.locked = value || undefined;
   };

   // Metodi:
   isCorrect() {
      // Verifica proprietà:
      if(this.#application === {})
         throw this.invalid_property;

      if(this.#application.title === undefined ||
         this.#application.description === undefined ||
         this.#application.sortid === undefined)
         throw this.invalid_property;
   };
   async new(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(name === undefined || name.length === 0)
         throw this.invalid_property;

      // Esiste già un'applicazione con questo nome?
      documents = await super._find("applications", { "_id": name });
      if(documents.length !== 0)
         throw this.already_exists;

      // Inizializza documento (da usare anche per il riutilizzo dell'istanza della classe):
      this.#application = {};
      this.#application.type = "application";
      this.#application.name = name;
      this.#application.sortid = 0;
      this.#application.locked = false;
   };
   async load(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(name === undefined || name.length === 0)
         throw this.invalid_property;

      // Legge dalla collezione il documento:
      documents = await super._load("applications", {"_id": name});
      if(documents.length === 0)
         throw this.not_found;

      // Valorizza proprietà privata:
      this.#application = documents[0];
   };
   async save() {
      // Controlla proprietà:
      this.isCorrect();

      // Completa proprietà dell'applicazione:
      if(this.#application.created_at === undefined)
         this.#application.created_at = new Date();
      else
         this.#application.changed_at = new Date();

      // Registra documento:
      await super._save("applications", this.#application.name, this.#application);
   }
   async remove(physical_deletion = false) {
      // In base al valore del parametro il documento viene semplicemente bloccato oppure cancellato
      // fisicamente:
      switch(physical_deletion) {
         case true:
            await super._remove("applications", {"_id": this.#application.name});
            break;

         case false:
            this.#application.locked = true;
            await this.save();
            break;
      }
   }
   async find(filter = { "type": "application"}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del filtro:
      if(filter === undefined || filter.length === 0)
         throw this.invalid_property;

      // Cerca i documenti che rispettano la chiave specificata:
      documents = await super._find("applications", filter, sort, options);
      return documents;
   }
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = Application;