# Creating the database
1. Ask for database name, and admin name and password
   If error, show popup and do nothing
2. Create if not exists all tables
   Also if error, show popup and do nothing
3. Then run the program as normal; 
   *login screen shows after selecting db name and loading*


# Adding items

## Via UI, 1 by 1

## Via CSV

# Operations

## Sale

### Client side
    0. Valid log in
    1. Adding product
        a. Validate ref w server
        b. Validate stock with total qty
        c. If product is already added, add 1 to qty
    2. Send buy request object
    3. If valid then
         show in-person code and clear products
       Else then
         show error and dont clear
       End

### Server side
    1. On product added
        a. Validate ref
        b. Validate total qty
    2. On buy request
        a. Validate all qtys again
    3. Iff valid
        a. Make individual Acts rows
        b. Edit Items[...].qty
        c. Make new Sales row (needs act ids)
            i.   send row id to print in UI
            ii.  generate PDF and save to folder with sale ID name
            iii. print buyer number and products to electron UI terminal

## Return

## Add

## Take

## Count

