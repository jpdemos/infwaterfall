

export class BaseView
{
	constructor( element )
	{
		this.Element = element || document.createElement( "div" ); // Sadly, we currently cannot use customElements in extensions.
		
		return Object.assign( this.Element, this ); // prototype doesn't inherit.
	}

	remove() // This function can't be called. TODO: fix.
	{
		return	this.destructor && this.destructor(),
				!!this.Element.parentNode && this.Element.parentNode.removeChild( this.Element );
	}
}