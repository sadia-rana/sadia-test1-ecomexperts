if (formData.get('id') === '45671309214014') {
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

      // Add the desired functionality from the 'else' block here
      this.submitButton.classList.remove('loading');
      if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
      if (!this.error) this.submitButton.removeAttribute('aria-disabled');
      this.querySelector('.loading-overlay__spinner').classList.add('hidden');

      // Code for quick modal and cart update from the 'else' block
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
      } else if (!this.cart) {
        window.location = window.routes.cart_url;
        return;
      }

      if (!this.error)
        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'product-form', productVariantId: formData.get('id') });
      this.error = false;

      // Code for quick modal and cart update
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
}