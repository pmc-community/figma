
const getExternalMDContent = async (file) => {
    $(window).on('load', () => {
        $.ajax({
            url: file,
            method: "GET",
            dataType: "text", // Set the expected data type
            success: async (data) => {
                var converter = new showdown.Converter();
                $('.main-content-wrap').append(converter.makeHtml(await data));
            },
            error: async (xhr, status, error) => {
                console.error("Error fetching file:", error); // Handle errors
            }
        });
    })   
}
