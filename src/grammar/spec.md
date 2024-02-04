# Grammar

## Literal
```
name = "Literal"
```

## Regex
```
digits = /\d+/
```

## Or
```
multiply = "*"
divide = "/"
operators = mulitply | divide
```

## And
```
first-name = "John"
last-name = "Doe"
full-name = first-name & last-name
```

## Repeat

The code below will match both `1,2,3,` & `1,2,3`. 
```
digit = /\d/
comma = ","
digits = digit* comma 
```

The code below will only match `1,2,3`. I will not match a trailing comma.
```
digit = /\d/
comma = ","
digits = digit* (comma) 
```

The code below will match `1,2,3` and `,,,` and `1,,` and is optional.
```
digit = /\d/
comma = ","
digits = digit?* comma
```

The code below will match `1,2,3` and `,,,` and requires at least one match.
```
digit = /\d/
comma = ","
digits = digit?+ comma 
```


