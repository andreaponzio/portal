/*&==================================================================================================================*
 *&
 *&=================================================================================================================*/
document.querySelector("#next").addEventListener("click", (event) => {
   // Dichiarazione riferimenti:
   let email = document.querySelector("#email");
   let title = document.querySelector("#title");
   let data = document.querySelector("#data");
   let error = 0;

   // Verifica che sia stato selezionato un destinatario:
   if(email.selectedIndex === 0) {
      email.classList.add("is-invalid");
      error++;
   }
   else
      email.classList.remove("is-invalid");

   // Verifica che sia stato inserito un titolo:
   if(title.value === "") {
      title.classList.add("is-invalid");
      error++;
   }
   else
      title.classList.remove("is-invalid");

   // Verifica che sia stato inserito un contenuto
   if(data.value === "") {
      data.classList.add("is-invalid");
      error++;
   }
   else
      data.classList.remove("is-invalid");

   // Se non si sono verificati errore, effettua submit:
   if(!error) {
      document.querySelector("#submit").submit();
   }
});