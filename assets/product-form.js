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
function handleAddToCart(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const id = formData.get('id');

  const cart = document.querySelector('.cart');

  if (id === '45671309214014') {
    const ids = ['45671309214014', '45644884836670']; // Array of IDs to add to the cart

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
        // Handle the response
        console.log(data);

        if (!cart.classList.contains('is-empty')) {
          cart.updateContents(data);
        } else {
          cart.classList.remove('is-empty');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } else {
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
        } else if (!cart) {
          window.location = window.routes.cart_url;
          return;
        }

        cart.updateContents(response);
      })
      .catch((e) => {
        console.error(e);
      });
  }
}