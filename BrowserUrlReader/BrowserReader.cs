using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Interop.UIAutomationClient;

public class BrowserReader
{
    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(
        IntPtr hWnd,
        out uint processId);

    public BrowserInfo? GetActiveBrowser()
    {
        var automation = new CUIAutomation8();

        IntPtr hwnd = GetForegroundWindow();
        if (hwnd == IntPtr.Zero)
            return null;

        var root = automation.ElementFromHandle(hwnd);

        GetWindowThreadProcessId(hwnd, out uint pid);

        string processName = Process
            .GetProcessById((int)pid)
            .ProcessName
            .ToLower();

        // Supported browsers
        if (processName != "chrome" &&
            processName != "brave" &&
            processName != "msedge" &&
            processName != "opera")
        {
            return null;
        }

        var browser = new BrowserInfo
        {
            Browser = processName,
            Title = CleanTitle(root.CurrentName, processName)
        };

        string omniboxClass = processName switch
        {
            "brave" => "BraveOmniboxViewViews",
            "chrome" => "OmniboxViewViews",
            "msedge" => "OmniboxViewViews",
            "opera" => "OmniboxViewViews",
            _ => ""
        };

        if (string.IsNullOrEmpty(omniboxClass))
            return browser;

        var omnibox = FindElementByClass(root, automation, omniboxClass);

        if (omnibox == null)
            return browser;

        try
        {
            var valuePattern = (IUIAutomationValuePattern)
                omnibox.GetCurrentPattern(UIA_PatternIds.UIA_ValuePatternId);

            browser.Url = valuePattern.CurrentValue;

            string url = browser.Url;

            if (!url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                !url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                url = "https://" + url;
            }

            browser.Domain = new Uri(url).Host;
        }
        catch
        {
            browser.Domain = browser.Url;
        }

        return browser;
    }

    private IUIAutomationElement? FindElementByClass(
        IUIAutomationElement element,
        IUIAutomation automation,
        string className)
    {
        if (element.CurrentClassName == className)
            return element;

        var children = element.FindAll(
            TreeScope.TreeScope_Children,
            automation.CreateTrueCondition());

        for (int i = 0; i < children.Length; i++)
        {
            var result = FindElementByClass(
                children.GetElement(i),
                automation,
                className);

            if (result != null)
                return result;
        }

        return null;
    }

    private string CleanTitle(string title, string browser)
    {
        if (string.IsNullOrWhiteSpace(title))
            return "";

        return browser switch
        {
            "chrome" => title.Replace(" - Google Chrome", ""),
            "brave" => title.Replace(" - Brave", ""),
            "msedge" => title.Replace(" - Microsoft Edge", "")
                             .Replace(" - Microsoft​ Edge", ""),
            "opera" => title.Replace(" - Opera", ""),
            _ => title
        };
    }
}