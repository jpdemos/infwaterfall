
// TODO: explain
export const ObserverService =
{
	Cache: {
		AwaitedElements: {}
	},

	async AwaitElement( elementTag )
	{
		if( this.Cache.AwaitedElements[ elementTag ] ) // If we already have something looking for this element, return the promise.
			return this.Cache.AwaitedElements[ elementTag ];

		this.Cache.AwaitedElements[ elementTag ] = new Promise( ( resolve ) =>
		{
			// Check if it already exists
			if( document.querySelector( elementTag ) )
				return resolve();

			let Observer = new MutationObserver( mutations =>
			{
				for( const mutation of mutations )
				{
					for( const node of Array.from( mutation.addedNodes ) )
					{
						if( node.nodeType === Node.ELEMENT_NODE && node.matches( elementTag ) )
						{
							Observer.disconnect();
							resolve();
						}
					}
				}
			} );

			Observer.observe( document.documentElement, { childList: true, subtree: true } );
		} );

		return this.Cache.AwaitedElements[ elementTag ];
	},

	AwaitChild( element, childTag )
	{
		return new Promise( ( resolve ) =>
		{
			// Check if it already exists
			if( Array.from( element.children ).find( child => child.matches( childTag ) ) )
				return resolve();

			const Observer = new MutationObserver( mutations =>
				{
					for( const mutation of mutations )
					{
						for( const node of Array.from( mutation.addedNodes ) )
						{
							if( node.nodeType === Node.ELEMENT_NODE && node.matches( childTag ) )
							{
								Observer.disconnect();
								resolve();
							}
						}
					}
				} );

			Observer.observe( element, { childList: true } );
		} );
	},

	AwaitEvent( element, event, check )
	{
		check = check || ( () => true );

		return new Promise( ( resolve ) =>
			element.addEventListener( event, function handler( ev )
			{
				if( check( ev ) )
					resolve( element.removeEventListener( event, handler ) )
			} )
		)
	}
}