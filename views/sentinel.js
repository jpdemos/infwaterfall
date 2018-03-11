import { BaseView } from "./base";

//
const AlertHook = function( entries )
{
	this.Element.dispatchEvent(
		new CustomEvent( "PresenceChange",
		{
			detail:
			{
				visible: entries[ 0 ].intersectionRatio > 0
			}
		}
	) )
}

// A sentinel that alerts when it's present in the viewport by dispatching a PresenceChange event
// I wish we could use custom HTML elements; but customElements doesn't seems to exist on document_start?
export class SentinelView extends BaseView
{
	static get tagName() { return "sentinel" }

	constructor( element )
	{
		super( element );

		this.Observer = new IntersectionObserver( AlertHook.bind( this ) );
		this.Observer.observe( this.Element );
	}

	destructor()
	{
		this.Observer.unobserve( this.Element );
	}
}
