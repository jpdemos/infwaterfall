import { TAG_HTML } from "../core/tags";
import { PAGE_TYPE, Selectors, STAGE } from "../providers/";
import { SentinelView } from "../views/sentinel";
//import { ViewsManager } from "../managers";
import { ObserverService } from "../services";

// I doubt we need to export this.
export const NextFeedFetcherSentinelId = TAG_HTML + "NextFeedFetcher";

const REGEX_MODIFIERS = /<style(.|\s)*?>|<link(.|\s)*?>|<script(.|\s)*?\/script>/g;

export const InfiniteFeedModule =
{
	USE_ON: [ PAGE_TYPE.FRONTPAGE, PAGE_TYPE.SUB ],

	DESCRIPTION: "Load the next page content upon reaching the bottom of the page",

	NextPage: "",

	async [ STAGE.INIT ]()
	{
		await ObserverService.AwaitElement( Selectors.NavigationButtons );

		this.NavigationButtons = document.querySelector( Selectors.NavigationButtons );
		this.NavigationButtons.style.display = "none";
	},

	[ STAGE.RUN ]()
	{
		this.SiteTable = document.querySelector( Selectors.SiteTable );
		this.NextFeedContainer = document.createElement( "div" );

		this.Sentinel = new SentinelView();
		this.Sentinel.setAttribute( "id", NextFeedFetcherSentinelId );
		this.Sentinel.addEventListener( "PresenceChange", ( event ) => event.detail.visible && !this.Retrieving && !this.ReachedEnd && this.NextPage && this.LoadNextPage() );

		// insert sentinel after the sitetable element
		this.SiteTable.parentNode.insertBefore( this.Sentinel.Element, this.SiteTable.nextSibling );

		this.NextPage = this.NavigationButtons.querySelector( ":scope .next-button > a" ).href;
	},

	async LoadNextPage()
	{
		this.Retrieving = true;
		// fetch and load next page
		let Page = await fetch( this.NextPage, { credentials: 'include' } );

		this.NextFeedContainer.innerHTML = ( await Page.text() ).replace( REGEX_MODIFIERS, "" );

		for( const element of this.NextFeedContainer.querySelectorAll( Selectors.SiteTable + " > *:not(.nav-buttons)" ) )
		{

			this.SiteTable.appendChild( element );
		}

		// TODO: manage end of content.
		this.NextPage = ( await this.NextFeedContainer.querySelector( Selectors.NavigationButtons + " .next-button > a" ) )
		
		if( this.NextPage )
			this.NextPage = this.NextPage.href;
		else
			this.ReachedEnd = true;
		
		this.Retrieving = false;
	},

	[ STAGE.DESTROY ]()
	{
		this.Sentinel.remove();

		document.querySelector( Selectors.NavigationButtons ).style.display = "";
	}
}