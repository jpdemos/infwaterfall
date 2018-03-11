import { PAGE_TYPE, Selectors, STAGE } from "../providers/";
import { ObserverService, CSSInjectorService } from "../services";
import { StylesManager } from "../managers";

// Determines the grid elements size based on factors (img size, remaining space, ...)
export const GridModule = 
{
	USE_ON: [ PAGE_TYPE.FRONTPAGE, PAGE_TYPE.SUB ],

	DefaultValues: {
		ColumnsCount: 5
	},

	Columns: [],

	async [ STAGE.INIT ]()
	{
		await ObserverService.AwaitElement( "html > body" );

 		// Disabling custom subreddit stylesheet(s) because they break the grid view.
		StylesManager.DisableCustomStyles();
		this.Stylesheet = CSSInjectorService.Inject( "GridModule" );
		
		await ObserverService.AwaitElement( Selectors.SiteTable ); // At this point, the site table is present but the HTML hasn't been parsed.

		this.CreateColumns();
		this.ProcessSiteTable(); // Append all current threads to columns;
		
		// Enable grid view
		document.querySelector( Selectors.SiteTable ).classList.add( "gridview" );
	},

	ObserveThreadInsertion()
	{
		this.ThreadsObserver = new MutationObserver( mutations =>
		{
			for( const mutation of mutations )
			{
				Array.from( mutation.addedNodes )
					.filter( node => node.nodeType === Node.ELEMENT_NODE )
					.forEach( node =>
						{
							if( node.matches( Selectors.Thread ) )
								this.ProcessThread( node )
							else if( node.matches( ".clearleft" ) )
								node.remove();
						} )
			}
		} );

		this.ThreadsObserver.observe( document.querySelector( Selectors.SiteTable ), { childList: true } );
	},

	CreateColumns()
	{
		for( let i=0; i < this.DefaultValues.ColumnsCount; i++ )
		{
			let ColumnElement = document.createElement( "div" );
			ColumnElement.classList.add( "grid-column" );

			if( i != 0 )
				ColumnElement.classList.add( "leftgap" );

			document.querySelector( Selectors.SiteTable ).appendChild( ColumnElement );
			this.Columns.push( ColumnElement );
		}

		// Apply the columns CSS
		this.Stylesheet.insertRule( `.gridview {
			grid-template-columns: repeat( ${this.Columns.length}, ${100 / this.Columns.length}% );
		}` );
	},

	ProcessSiteTable()
	{
		document.querySelectorAll( Selectors.SiteTable + " > .clearleft" )
			.forEach( element => element.remove() );
		
		document.querySelectorAll( Selectors.Threads )
			.forEach( element => this.ProcessThread( element ) );
	},

	ProcessThread( Thread )
	{
		// Insert thread in the smallest column.
		let ChoosenColumn;
		this.Columns.forEach( Column => ChoosenColumn = ChoosenColumn ? ( Column.offsetHeight < ChoosenColumn.offsetHeight ? Column : ChoosenColumn ) : Column );

		ChoosenColumn.appendChild( Thread );

		let Header = Thread.querySelector( ":scope > .entry .top-matter .title" );
		let SubmissionInfo = Thread.querySelector( ":scope > .entry .top-matter .tagline" );
		let Actions = Thread.querySelector( ":scope > .entry .top-matter .flat-list" );

		// Add custom classes
		Header.classList.add( "card-header" );
		SubmissionInfo.classList.add( "card-sub-infos" );
		Actions.classList.add( "card-actions" );

		let CommentsCounter = Actions.querySelector( ":scope a.comments" );
		if( CommentsCounter )
			CommentsCounter.textContent = CommentsCounter.textContent.replace( /comments?/, "" );

		this.LoadContent( Thread );
		
		//Actions.querySelectorAll( ":scope > li:not(:first-of-type)" )
		//	.forEach( Action => Action.classList.add( "icon", Action.textContent, "no-text" ) );

		Thread.appendChild( Header );
		Thread.appendChild( SubmissionInfo );
		Thread.appendChild( Actions );


	},

	async LoadContent( Thread ) // State: POC.
	{
		let DataUrl = Thread.getAttribute( "data-url" );

		if( !DataUrl )
			return;

		let ContentType;
		let Domain;
		let EndURL;
		let Url;

		if( !DataUrl.startsWith( "/" ) )
		{
			Url = new URL( DataUrl );

			Domain = Url.hostname.match( "([^\.]+)\.[^\.]+?$" )[ 1 ];
			EndURL = Url.href.replace( /^(http)([^s])/, "https$2" );
			
			if( Url.pathname.indexOf( "." ) == -1 && Domain == "imgur" ) // Album. Not supported yet.
				return;
	
			switch( Domain )
			{
				case "imgur":
					EndURL = EndURL.replace( /(gifv?)$/, "mp4" );
					ContentType = "media";
					break;
				case "gfycat":
					EndURL = EndURL.replace( /^(.+?\/\/)()(g)/, "$1giant.$3" ) + ".webm";
					ContentType = "media";
					break;
				default: // Unsupported domain
					return;
			}
		}
		else
		{ // Internal link.
			ContentType = "self";
		}

		if( !ContentType )
			return;

		let ContentElement = "img";

		if( ContentType == "media" )
		{
			if( /(?:gifv?|mp4|webm)$/.test( EndURL.match( /[^\.]+$/ )[ 0 ] ) )
				ContentElement = "video";
		}

		if( ContentType == "self" )
			ContentElement = "span";

		let ContentContainerNode = document.createElement( "div" );
		ContentContainerNode.classList.add( "card-content" );

		let ContentNode = document.createElement( ContentElement );

		ContentContainerNode.appendChild( ContentNode );
		
		switch( ContentElement )
		{
			case "video":
				ContentNode.setAttribute( "src", EndURL );
				ContentNode.loop = true;
				ContentNode.muted = true;

				ContentContainerNode.classList.add( "video" );

				ContentNode.addEventListener( "click", () =>
					ContentNode.paused ?
						( ContentNode.play(), ContentNode.controls = true, ContentContainerNode.classList.add( "play" ) ) :
						( ContentNode.pause(), ContentNode.controls = false, ContentContainerNode.classList.remove( "play" ) ) );
				break;
			case "img":
				ContentNode.setAttribute( "src", EndURL );
				break;
			case "span":
				let Page = await fetch( location.origin + DataUrl );

				let container = document.implementation.createHTMLDocument();
				container.documentElement.innerHTML = await Page.text();
				let Text = container.querySelector(":scope #siteTable .thing .usertext-body p");

				if(!Text)
					break;

				container.documentElement.innerHTML = "";
				ContentNode.textContent = Text.textContent;

				ContentNode.classList.add( "text" );
				break;
		}

		Thread.appendChild( ContentContainerNode );
	},

	[ STAGE.RUN ]()
	{
		this.ObserveThreadInsertion();
	},

	[ STAGE.DESTROY ]()
	{
		this.ThreadsObserver.disconnect();
		this.Stylesheet.ownerNode.remove();

		StylesManager.EnableCustomStyles();

		let SiteTable = document.querySelector( Selectors.SiteTable );

		// replace all threads from the columns into the site table
		for( const column of this.Columns )
		{
			for( const thread of column.childNodes )
				SiteTable.appendChild( thread );
			
			column.remove();
		}

		this.ElementsCount = 0;
	}
}