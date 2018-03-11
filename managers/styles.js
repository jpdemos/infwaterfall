import { ObserverService } from "../services";

// Manage the docuements styles
export const StylesManager = 
{
	Documents: {},

	async Initialize()
	{
		await ObserverService.AwaitElement( "html > body" );

		this.DisableCustomStyles();
	},

	GetCustomStylesheet( Doc )
	{
		Doc = Doc || document;

		if( this.Documents[ Doc ] !== undefined )
			return this.Documents[ Doc ];

		for( const sheet of Doc.styleSheets )
			if( sheet.title && sheet.title == "applied_subreddit_stylesheet" )
				return this.Documents[ Doc ] = sheet;

		this.Documents[ Doc ] = false; // No custom stylesheet found
		Doc.documentElement.classList.add( "noCustomStyles" );

		return this.Documents[ Doc ]; 
	},

	DisableCustomStyles( Doc )
	{
		let sheet = this.GetCustomStylesheet( Doc );

		if( sheet == false ) // No custom stylesheet
			return;

		sheet.disabled = true;
		document.documentElement.classList.add( "customStylesDisabled" );
	},

	EnableCustomStyles( Doc )
	{
		let sheet = this.GetCustomStylesheet( Doc );

		if( sheet == false ) // No custom stylesheet
			return;

		sheet.disabled = true;
		Doc.documentElement.classList.remove( "customStylesDisabled" );
	},
}