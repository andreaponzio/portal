/* -------------------------------------------------------------------------------------------------+
* | Description:
* +------------------------------------------------------------------------------------------------*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Dichiarazione riferimenti:
   let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
   let email = document.querySelector("#email");
   let data = document.querySelector("#data");
   let error = 0;

   // Controlla coerenza dell'indirizzo e-mail:
   if(email.value === "" || !regex.test(email.value)) {
      email.classList.add("is-invalid");
      error++;
   }
   else
      email.classList.remove("is-invalid");

   // Controlla contenuto:
   if(data.value.length === 0) {
      data.classList.add("is-invalid");
      error++;
   }
   else
      data.classList.remove("is-invalid");

   // Effettua submit:
   if(!error)
      document.querySelector("#submit").submit();
});