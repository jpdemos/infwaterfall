// Provides elements' selectors

const Selectors =
{
	// Main and unique elements
	SiteTable:			"#siteTable",
	Sidebar:			"body > .side",
	Footer:				"body > .footer-parent",

	// Things
	Comment:			".thing[id^=thing_t1_]",
	//Account:			".thing[id^=thing_t2_]",
	Thread:				".thing[id^=thing_t3_]",
	//Message:			".thing[id^=thing_t4_]",
	//Subreddit:		".thing[id^=thing_t5_]",
	//Award:			".thing[id^=thing_t6_]",
}

// Combinations
Selectors.Threads			= Selectors.SiteTable + " " + Selectors.Thread; // Selectors.Thread is the same.
Selectors.NavigationButtons	= Selectors.SiteTable + " > .nav-buttons";

export { Selectors };