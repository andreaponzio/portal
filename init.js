/*&---------------------------------------------------------------------*
 *& Moduli e istanza oggetti.
 *&---------------------------------------------------------------------*/
const crypto = require("bcrypt");

const config = require("./public/config.json");
const Application = require("./libraries/Application");
const Profile = require("./libraries/Profile");
const User = require("./libraries/User");

class Init {
   constructor() {};
   async initApplications() {
      let application = new Application();

      try {
         await application.open(config.database.dbname, config.database.address, config.database.port);

         await application.new("user_not_completed");
         application.title = "Completa la registrazione";
         application.description = "E' necessario completare la registrazione";
         await application.save();

         await application.new("administrator");
         application.title = "Amministrazione";
         application.description = "Permette di amministrare il Portale dell'Utente";
         await application.save();

         await application.close();
      }
      catch(ex) {
         console.log("app:" + ex);
      }
   };
   async initProfile() {
      let profile = new Profile();

      try {
         await profile.open(config.database.dbname, config.database.address, config.database.port);

         await profile.new("user_not_completed");
         profile.description = "Profilo registrazione da completare";
         profile.admin = false;
         await profile.add("user_not_completed");
         await profile.save();

         await profile.new("administrator");
         profile.description = "Profilo di amministrazione";
         profile.admin = true;
         await profile.add("administrator");
         await profile.save();

         await profile.close();
      }
      catch(ex) {
         console.log("prof:" + ex);
      }
   };
   async initUser() {
      let user = new User();

      try {
         await user.open(config.database.dbname, config.database.address, config.database.port);

         await user.new("admin@localhost");
         user.name = "Amministratore";
         user.password = crypto.hashSync("docker@portal", 12);
         user.security = crypto.hashSync("docker@portal", 12);
         user.profile = "administrator";
         await user.save();

         await user.new("andrea.ponzio@gmail.com");
         user.name = "Andrea Ponzio";
         user.password = crypto.hashSync("docker@portal", 12);
         user.security = crypto.hashSync("docker@portal", 12);
         user.profile = "administrator";
         await user.save();

         await user.close();
      }
      catch(ex) {
         console.log("user:" + ex);
      }
   };
}

module.exports = Init;

/*
const Init = require("./init");
let i = new Init();

(async() => {
   await i.initApplications();
   await i.initProfile();
   await i.initUser();
})().catch(error => {
});
*/