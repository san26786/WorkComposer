using System.Text.Json;
using Windows.Devices.Geolocation;

try
{
    var access = await Geolocator.RequestAccessAsync();

    if (access != GeolocationAccessStatus.Allowed)
    {
        Console.WriteLine(JsonSerializer.Serialize(new
        {
            Success = false,
            Error = "Location permission denied."
        }));
        return;
    }

    var geolocator = new Geolocator
    {
        DesiredAccuracyInMeters = 20
    };

    var position = await geolocator.GetGeopositionAsync();

    Console.WriteLine(JsonSerializer.Serialize(new
    {
        Success = true,
        Latitude = position.Coordinate.Point.Position.Latitude,
        Longitude = position.Coordinate.Point.Position.Longitude,
        Accuracy = position.Coordinate.Accuracy,
        Timestamp = position.Coordinate.Timestamp
    }));
}
catch (Exception ex)
{
    Console.WriteLine(JsonSerializer.Serialize(new
    {
        Success = false,
        Error = ex.Message
    }));
}