#OVERVIEW

Pushdown template that accepts a collapsed creative (Flash and/or image - 970x66) and an expanded creative (Flash and/or image - 970x418). If two Flash creatives and two image creatives are used in this template, the Flash creatives will be used if the browser supports Flash, and the image creatives will be used as a fallback if the browser does not support Flash. A single static backup image can also be used (970x66) in this template and will render only if Flash creatives are used without expanded/collapsed creatives and the browser does not support Flash. This template was designed to work on both washingtonpost.com and slate.com.

#REQUIREMENTS

These are the required assets for a pushdown

- 1 Flash collapsed creative and/or 1 collapsed image creative (__970x66__)
- 1 Flash expanded creative and/or 1 expanded image creative (__970x418__)
- 1 backup image (__970x66__)

#CONSTRAINTS

- Max __50KB__ initial load for collapsed creative
- Max __100KB__ initial load for expanded creative
- Max __100KB__ polite load for collapsed creative
- Max __150KB__ polite load for expanded creative
- Max video weight __2MB__ (if creative includes video)

#CLICKTHRUS

Multiple clickthru's are supported for flash creatives. These are passed into the Flash creatives via flashvars in the following format (case sensitive): __clickTag__, __clickTag2__, __clickTag3__, ...etc. Check for these with ActionScript and assign to clickable areas as necessary.

#TRACKING PIXELS

3rd party tracking via pixels is available for:

- Impressions
- Clicks to expand
- Clicks to collapse

Washington Post is able to provide total impression numbers from DFP, but tracking pixels __must__ be provided for all other available tracking.

#USAGE

The following code needs to be executed in the relavent .swf to open/close the pushdown:

###Expanding pushdown from Flash AS3 example

    if(ExternalInterface.available){
      ExternalInterface.call('function(){try{wpAd.push.expand(true);}catch(e){}}');
    }


###Collapsing pushdown from Flash AS3 example

    if(ExternalInterface.available){
      ExternalInterface.call('function(){try{wpAd.push.collapse(true);}catch(e){}}');
    }

For reference, the JavaScript function calls that expand and collapse the pushdown are:

###Expand
    wpAd.push.expand(true);

###Collapse
    wpAd.push.collapse(true);
    
## 
######_Last updated 10/10/12 by Mike Spencer_