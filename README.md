# Shortlinks
(Firefox) Browser Extension for Shortlinks to make navigating to frequent pages easier.

## Examples
Typing `c/` will open Google Calendar.

## Building from Source
You need a valid closure compiler aliased to `closurecompiler`. Then, execute:

```bash
closurecompiler --js "src/**.js" --js_output_file build/background-compiled.js
```

Alternatively, if you don't want to alias the compiler, just replace `closurecompiler`
with `java -jar /path/to/closurecompiler.jar`.
