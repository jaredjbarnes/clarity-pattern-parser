Create a utility that returns all possible routes through a pattern. We can do this by traversing through the pattern and getting down to regex and literals. 

Get all patterns from parent of failed pattern or last completed pattern. Check if we are on a RegExPattern and if we are, we put the next expected value pattern after it. 

We could return an object with the valid range, an error range, and possible branches.