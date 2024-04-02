<!--- HEADS UP!!! --->
<!--- IN THE SCRIPT BELOW, THE SYNTAX MUST BE 100% STRICT --->
<!--- EACH LINE MUST END WITH ';' --->
<!--- NOO JAVASCRIPT COMMENTS ARE ALLOWED --->
<!--- OTHERWISE, PARSING CAN BE WRONG AND THE SCRIPT MAY BE NOT EXECUTED --->

<!--- HEADS UP!!! --->
<!--- ANY CONTENT TO BE RENDERED BEFORE THE EXTERNAL CONTENT MUST BE GIVEN --->
<!--- AS THE LAST PARAMETER TO THE FUNCTION, OTHERWISE MAY NOT STICK TOGETHER --->
<!--- WITH THE EXTERNAL CONTENT DUE TO THE ASYNC NATURE OF HTTP REQUEST --->

<script>
    const start = `{{ site.startExposedSection }}`;
    const end = `{{ site.endExposedSection }}`;
    console.log('part');
    getExternalMDContent (
        'https://raw.githubusercontent.com/pmc-community/figma/main/ReactPluginTemplate/README.md', 
        'before',
        start,
        end,
        '```Markdown content generated from a part of partial loaded from an external md file```'
    );
</script>
