def calculate_grade(scores):
    """Calculate the final grade based on a list of scores."""
    if not scores:
        return "No scores provided"
    
    total = 0
    count = 0
    
    for score in scores:
        if 0 <= score <= 100:
            total += score
            count += 1
        else:
            print(f"Invalid score: {score}")
    
    if count == 0:
        return "No valid scores"
    
    average = total / count
    
    if average >= 90:
        grade = "A"
    elif average >= 80:
        grade = "B"
    elif average >= 70:
        grade = "C"
    elif average >= 60:
        grade = "D"
    else:
        grade = "F"
    
    return f"Final Grade: {grade} (Average: {average:.2f})" 