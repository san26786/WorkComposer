using System.Text.Json;

class Program
{
    static void Main()
    {
        var reader = new BrowserReader();

        BrowserInfo? browser = reader.GetActiveBrowser();

        if (browser == null)
        {
            Console.WriteLine("{}");
            return;
        }

        Console.WriteLine(
            JsonSerializer.Serialize(
                browser,
                new JsonSerializerOptions
                {
                    WriteIndented = true
                }
            )
        );
    }
}