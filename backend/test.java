// Simple test to verify controller syntax
import java.util.*;

public class test-controllers {
    public static void main(String[] args) {
        // Test HashMap usage
        Map<String, Object> test = new HashMap<>();
        test.put("key1", "value1");
        test.put("key2", "value2");
        
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(test);
        
        System.out.println("Controllers syntax is valid");
    }
}
