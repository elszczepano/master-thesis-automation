const submitButton = document.getElementById( 'submitButton' );
const submitContainer = document.getElementById( 'submitContainer' );
const scanProfileForm = document.getElementById( 'scanProfile' );

scanProfileForm.addEventListener( 'submit', () => {
	const createLoadingSpinnerButton = document.createElement( 'button' );

	createLoadingSpinnerButton.classList.add( 'button', 'is-link', 'is-loading', 'spinner_button', 'is-medium' );

	submitButton.remove();
	submitContainer.appendChild( createLoadingSpinnerButton );

	submitButton.classList.add( 'is-loading' );
}, { once: true } );
