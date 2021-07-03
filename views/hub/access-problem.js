/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Inizializza proprietà locali:
   let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
   let email = document.querySelector("#email");
   let security = document.querySelector("#security");
   let error = 0;

   // Controlla coerenza dell'indirizzo e-mail:
   if(email.value === "" || !regex.test(email.value)) {
      email.classList.add("is-invalid");
      error++;
   }
   else {
      email.classList.remove("is-invalid");
   }

   // Controlla la presenza della frase di sicurezza:
   if(security.value.length === 0) {
      security.classList.add("is-invalid");
      error++;
   }
   else
      security.classList.remove("is-invalid");

   // Effettua submit:
   if(!error)
      document.querySelector("#submit").submit();
});