const Base = require("../libraries/Base");

class User extends Base {
   // Dichiarazione proprietà private:
   #user = {};

   // Costruttore della classe User:
   constructor(database = undefined) {
      super(database);
   };

   // Get delle proprietà dell'utente:
   get email() {
      return this.#user._id;
   };
   get name() {
      return this.#user.name;
   };
   get password() {
      return this.#user.password;
   };
   get security() {
      return this.#user.security;
   };
   get locked() {
      return this.#user.locked;
   };
   get id() {
      return this.#user.id;
   };
   get profile() {
      return this.#user.profile;
   };
   get created_at() {
      return this.#user.created_at;
   };
   get changed_at() {
      return this.#user.changed_at;
   };

   // Set delle proprietà dell'utente:
   set name(value) {
      this.#user.name = value || undefined;
   };
   set password(value) {
      this.#user.password = value || undefined;
   };
   set security(value) {
      this.#user.security = value || undefined;
   };
   set profile(value) {
      this.#user.profile = value || undefined;
   };
   set locked(value) {
      this.#user.locked = value || undefined;
   };

   // Metodi:
   isCorrect() {
      // Verifica proprietà:
      if(this.#user === {})
         throw this.invalid_property;

      if(this.#user.name === undefined || this.#user.password === undefined ||
         this.#user.security === undefined || this.#user.profile === undefined)
         throw this.invalid_property;
   };
   async new(email) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(email === undefined || email.length === 0)
         throw this.invalid_property;

      // L'indirizzo e-mail è già registrato?
      documents = await super._find("users", { "_id": email });
      if(documents.length !== 0)
         throw this.already_exists;

      // Inizializza documento (da usare anche per il riutilizzo dell'istanza della classe):
      this.#user = {};
      this.#user.type = "user";
      this.#user._id = email;
      this.#user.locked = false;
   };
   async load(email) {
      // Inizializza proprietà locali:
      let documents = [];

      // Verifica chiave del documento:
      if(email === undefined || email.length === 0)
         throw this.invalid_property;

      // Legge dalla collezione il documento:
      documents = await super._load("users", {"_id": email});
      if(documents.length === 0)
         throw this.not_found;

      // Valorizza proprietà privata:
      this.#user = documents[0];
   };
   async save() {
      // Controlla proprietà:
      this.isCorrect();

      // Genera identificativo da assegna alla chiave del documento:
      if(this.#user.id === undefined) {
         this.#user.id = await super._getIntervalNextNumber("users");
         this.#user.created_at = new Date();
      }
      else
         this.#user.changed_at = new Date();

      // Registra documento:
      await super._save("users", this.#user._id, this.#user);
   }
   async remove(physical_deletion = false) {
      // In base al valore del parametro il documento viene semplicemente bloccato oppure cancellato
      // fisicamente:
      switch(physical_deletion) {
         case true:
            await super._remove("users", {"_id": this.#user.email});
            break;

         case false:
            this.#user.locked = true;
            await this.save();
            break;
      }
   }
   async find(filter = { "type": "user"}, sort = {}, options = {}) {
      // Inizializza proprietà locali:
      let documents = [];

      // Controlla presenza del filtro:
      if(filter === undefined || filter.length === 0)
         throw this.invalid_property;

      // Cerca i documenti che rispettano la chiave specificata:
      documents = await super._find("users", filter, sort, options);
      return documents;
   }
}

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = User;