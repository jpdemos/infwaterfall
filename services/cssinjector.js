
let InjectedStylesheets = {};

// TODO: explain
export const CSSInjectorService =
{
	Inject( name )
	{
		if( InjectedStylesheets[ name ] )
			return InjectedStylesheets[ name ].sheet;
		
		InjectedStylesheets[ name ] = document.createElement( "style" );

		document.head.appendChild( InjectedStylesheets[ name ] );

		return InjectedStylesheets[ name ].sheet;
	},

	Delete( name )
	{
		InjectedStylesheets[ name ].remove();
	}
}
