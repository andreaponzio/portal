const express = require("express");
const crypto = require("bcrypt");
const User = require("../libraries/User");

const config = require("../public/config.json").database;

const router = express.Router();

/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
router.get("/settings", async(request, response) => {
   // Render della pagina delle impostazioni utente:
   response.render("setup/settings", {
      "title": "Profilo utente"
   });
});
router.post("/settings", async(request, response) => {
   // Inizializza proprietà locali:
   let user = new User();
   let changed = false;

   // Verifica quali campi sono cambianti così da modificare l'utente. Al termina, viene effettuato
   // un logoff:
   try {
      await user.open(config.dbname, config.address, config.port);
      await user.load(request.session.userdata.email);

      if(request.body.name !== request.session.userdata.name) {
         user.name = request.body.name;
         changed = true;
      }
      if(request.body.password.length !== 0 && request.body.repassword.length !== 0) {
         user.password = crypto.hashSync(request.body.password, 12);
         changed = true;
      }
      if(request.body.security.length !== 0 && request.body.resecurity.length !== 0) {
         user.security = crypto.hashSync(request.body.security, 12);
         changed = true;
      }

      // Registra modifiche ed effettua il corretto redirect:
      if(changed) {
         await user.save();
         response.redirect("/logoff");
      }
      else
         response.redirect("/logoff");
   }
   catch(ex) {
      response.send(ex);
   }
   finally {
      await user.close();
      user = undefined;
   }
});

/*&==================================================================================================================*
 *& Esporta modulo
 *&=================================================================================================================*/
module.exports = router;