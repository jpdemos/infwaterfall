import { EXEC_STAGE } from ".";


export const PAGE_TYPE = {
	FRONTPAGE: 1,
	SUB: 2,
	THREAD: 3
};

const PAGE_REGEX = { // TODO: replace
	FRONTPAGE: /^\/(?:hot|new|rising|controversial|top)?(?:\/|$)/i,
	SUB: /^\/r\/([\w_]+)(?:(?:\/(?:hot|new|rising|controversial|top)?\/?$)|$)/i,
	THREAD: /^\/(?:r\/([\w\.]+)\/|(u(?:ser)?\/[\w-]+)\/)?comments\/([a-z0-9]+)(?:\/|$)/i
};

// Provides the sub name, page type, ...
export const LocationProvider =
{
	PageType: 0,

	Initialize()
	{
		// Setup page type
		this.UpdatePageType();
	},

	UpdatePageType()
	{
		for( const PageType in PAGE_REGEX )
		{
			if( PAGE_REGEX[ PageType ].test( location.pathname ) )
			{
				this.PageType = PAGE_TYPE[ PageType ];
				break;
			}
		}
	},

	// This should only be called when we are on a PAGE_TYPE.SUB or PAGE_TYPE.THREAD
	get SubName()
	{
		return this._SubName || ( this._SubName = PAGE_REGEX.SUB.exec( location.pathname )[1] );
	}

}