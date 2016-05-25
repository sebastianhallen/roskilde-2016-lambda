const foo = "## https://forums.aws.amazon.com/thread.jspa?messageID=673012&tstart=0#673012 \n" +
"## convert HTML POST data or HTTP GET query string to JSON \n" +
"  \n" +
"## get the raw post data from the AWS built-in variable and give it a nicer name \n" +
"#if ($context.httpMethod == \"POST\") \n" +
" #set($rawAPIData = $input.path('$')) \n" +
"#elseif ($context.httpMethod == \"GET\") \n" +
" #set($rawAPIData = $input.params().querystring) \n" +
" #set($rawAPIData = $rawAPIData.toString()) \n" +
" #set($rawAPIDataLength = $rawAPIData.length() - 1) \n" +
" #set($rawAPIData = $rawAPIData.substring(1, $rawAPIDataLength)) \n" +
" #set($rawAPIData = $rawAPIData.replace(\", \", \"&\")) \n" +
"#else \n" +
" #set($rawAPIData = \"\") \n" +
"#end \n" +
"  \n" +
"## first we get the number of \"&\" in the string, this tells us if there is more than one key value pair \n" +
"#set($countAmpersands = $rawAPIData.length() - $rawAPIData.replace(\"&\", \"\").length()) \n" +
"  \n" +
"## if there are no \"&\" at all then we have only one key value pair. \n" +
"## we append an ampersand to the string so that we can tokenise it the same way as multiple kv pairs. \n" +
"## the \"empty\" kv pair to the right of the ampersand will be ignored anyway. \n" +
"#if ($countAmpersands == 0) \n" +
" #set($rawPostData = $rawAPIData + \"&\") \n" +
"#end \n" +
"  \n" +
"## now we tokenise using the ampersand(s) \n" +
"#set($tokenisedAmpersand = $rawAPIData.split(\"&\")) \n" +
"  \n" +
"## we set up a variable to hold the valid key value pairs \n" +
"#set($tokenisedEquals = []) \n" +
"  \n" +
"## now we set up a loop to find the valid key value pairs, which must contain only one \"=\" \n" +
"#foreach( $kvPair in $tokenisedAmpersand ) \n" +
" #set($countEquals = $kvPair.length() - $kvPair.replace(\"=\", \"\").length()) \n" +
" #if ($countEquals == 1) \n" +
"  #set($kvTokenised = $kvPair.split(\"=\")) \n" +
"  #if ($kvTokenised[0].length() > 0) \n" +
"   ## we found a valid key value pair. add it to the list. \n" +
"   #set($devNull = $tokenisedEquals.add($kvPair)) \n" +
"  #end \n" +
" #end \n" +
"#end \n" +
"  \n" +
"## next we set up our loop inside the output structure \"{\" and \"}\" \n" +
"{ \n" +
"#foreach( $kvPair in $tokenisedEquals ) \n" +
"  ## finally we output the JSON for this pair and append a comma if this isn't the last pair \n" +
"  #set($kvTokenised = $kvPair.split(\"=\")) \n" +
" \"$util.urlDecode($kvTokenised[0])\" : #if($kvTokenised.size() > 1 && $kvTokenised[1].length() > 0)\"$util.urlDecode($kvTokenised[1])\"#{else}\"\"#end#if( $foreach.hasNext ),#end \n" +
"#end \n" +
"} ";

console.log(JSON.stringify(foo));