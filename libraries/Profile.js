const Base = require("../libraries/Base");

class Profile extends Base {
   // Dichiarazione proprietà private:
   #profile = {};

   // Costruttore della classe Profile:
   constructor(d) {
      super();
   };

   // Get delle proprietà del profilo:
   get name() {
      return this.#profile.name;
   };
   get description() {
      return this.#profile.description;
   };
   get admin() {
      return this.#profile.admin;
   };
   get locked() {
      return this.#profile.locked;
   };
   get created_at() {
      return this.#profile.created_at;
   };
   get changed_at() {
      return this.#profile.changed_at;
   };
   get applications() {
      return this.#profile.applications;
   };

   // Set delle proprietà del profilo:
   set description(value) {
      this.#profile.description = value || undefined;
   };
   set admin(value) {
      this.#profile.image = value || undefined;
   };
   set locked(value) {
      this.#profile.locked = value || undefined;
   };

   isCorrect() {
      // Verifica proprietà:
      if(this.#profile === {})
         throw this.invalid_property;

      if(this.#profile.description === undefined)
         throw this.invalid_property;
   };
   async new(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(name === undefined || name.length === 0)
         throw this.invalid_property;

      // Inizializza documento (da usare anche per il riutilizzo dell'istanza della classe):
      this.#profile = {};
      this.#profile.type = "profile";
      this.#profile.name = name;
      this.#profile.admin = false;
      this.#profile.locked = false;
   };
   async load(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(name === undefined || name.length === 0)
         throw this.invalid_property;

      // Legge dalla collezione il documento:
      documents = await super._load("profiles", {"_id": name});

      // Valorizza proprietà privata:
      this.#profile = documents[0];
   };
   async save() {
      // Controlla proprietà:
      this.isCorrect();

      // Completa proprietà del profilo:
      if(this.#profile.created_at === undefined)
         this.#profile.created_at = new Date().toISOString();
      else
         this.#profile.changed_at = new Date().toISOString();

      // Registra documento:
      await super._save("profiles", this.#profile.name, this.#profile);
   }
   async remove(physical_deletion = false) {
      // In base al valore del parametro il documento viene semplicemente bloccato oppure cancellato
      // fisicamente:
      switch(physical_deletion) {
         case true:
            await super._remove("profiles", {"_id": this.#profile.name});
            break;

         case false:
            this.#profile.locked = true;
            await this.save();
            break;
      }
   }
   async find(filter = { "type": "profile"}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del filtro:
      if(filter === undefined || filter.length === 0)
         throw this.invalid_property;

      // Cerca i documenti che rispettano la chiave specificata:
      documents = await super._find("profiles", filter, sort, options);
      return documents;
   }
   async add(name) {
      // Inizializza proprietà locali:
      let documents = [];

      // Per poter aggiungere un'applicazione al profilo, questa deve esistere:
      documents = await super._find("applications", { "_id": name });
      if(documents.length === 0)
         throw this.not_found;

      // Aggiunge applicazione al profilo:
      if(this.#profile.applications === undefined)
         this.#profile.applications = [];
      this.#profile.applications.push(name);
   };
   del(name) {
      // Inizializza proprietà locali:
      let index = -1;

      // Elimina l'applicazione dal profilo:
      if(this.#profile.applications !== undefined) {
         index = this.#profile.applications.indexOf(name);
         if(index !== -1)
            this.#profile.applications.splice(index, 1);
      }
   };
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = Profile;