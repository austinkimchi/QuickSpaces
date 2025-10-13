import populartimes
import sys

def main():
    if len(sys.argv) > 2:
        print(populartimes.get_id(sys.argv[1], sys.argv[2]))
    else:
        print("No arguments provided.")

if __name__ == "__main__":
    main()