// Sadia: Custom code for dropdown started.
//  verifying if the specific product page. 
if(document.getElementById("variant-radios-template--19635874562366__main")){
  // html for the size selector  
sizeHtml = `<label>Size</label>
<select id="vselect" style="width: 100%;padding: 11px;margin-bottom: 20px;">
    <option value="template--19635874562366__main-2-0" Selected>Unselected</option>
    <option value="template--19635874562366__main-2-1" >Small</option>
    <option value="template--19635874562366__main-2-2">Medium</option>
    <option value="template--19635874562366__main-2-3">Large</option>
</select>`;
  // passing the html to show new size dropdown.
document.getElementById("variant-radios-template--19635874562366__main").innerHTML += sizeHtml
  // once user will select the size automaticly update the size from new dropdown. 
document.getElementById('vselect').onchange = function(d){ document.getElementById(d.target.value).click() ;}
  // hiding the original size selector.
  document.querySelector('.product-form__input:nth-child(2)').style = "display:none";
}
// Sadia: Custom code ended.

if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        // Sadia: Custom code started for adding extra product with medium
        
        var matchId = formData.get('id');
        // verifying if the product is only medium.
        
        console.log('matchId: ',matchId);
        
        if(matchId == '45671309214014'){
          const ids = [matchId, '45644884836670']; // Array of IDs to add to the cart
    
          const updates = {}; // Object to store the updates
    
          // Populate the updates object with the IDs and quantities
          ids.forEach(id => {
            updates[id] = 1; // Set the quantity as 1 for each ID
          });
        
          const formData = {
            'updates': updates
          };
        
          fetch(window.Shopify.routes.root + 'cart/update.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          })
          .then(response => {
            return response.json();
          })
          .then(data => {
            // Handle the response if needed
            console.log(data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
        }
  
      // Sadia: Custom code ended for adding extra product with medium
  
  fetch(`${routes.cart_add_url}`, config)
    .then((response) => response.json())
    .then((response) => {
      if (response.status) {
        publish(PUB_SUB_EVENTS.cartError, {
          source: 'product-form',
          productVariantId: formData.get('id'),
          errors: response.errors || response.description,
          message: response.message,
        });
        this.handleErrorMessage(response.description);

        const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
        if (!soldOutMessage) return;
        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.querySelector('span').classList.add('hidden');
        soldOutMessage.classList.remove('hidden');
        this.error = true;
        return;
      } else if (!this.cart) {
        window.location = window.routes.cart_url;
        return;
      }

      if (!this.error)
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', productVariantId: formData.get('id') });
      this.error = false;
      const quickAddModal = this.closest('quick-add-modal');
      if (quickAddModal) {
        document.body.addEventListener(
          'modalClosed',
          () => {
            setTimeout(() => {
              this.cart.renderContents(response);
            });
          },
          { once: true }
        );
        quickAddModal.hide(true);
      } else {
        this.cart.renderContents(response);
      }

      // Add the desired functionality from the 'if' block here
      this.submitButton.classList.remove('loading');
      if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
      if (!this.error) this.submitButton.removeAttribute('aria-disabled');
      this.querySelector('.loading-overlay__spinner').classList.add('hidden');
    })
    .catch((e) => {
      console.error(e);
    });
// }

      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
