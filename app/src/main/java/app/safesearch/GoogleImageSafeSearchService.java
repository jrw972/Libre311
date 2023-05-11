package app.safesearch;

import io.micronaut.context.annotation.Property;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

@Singleton
public class GoogleImageSafeSearchService {

    @Inject
    SafeSearchClient client;

    @Property(name = "wemove.safesearch.key")
    protected String key;

    public boolean imageIsExplicit(String image) {
        boolean isImageExplicit = true;

        try {
            Map payload = Map.of(
                    "requests", List.of(
                            Map.of(
                                    "image", Map.of("content", image),
                                    "features", List.of(Map.of("type", "SAFE_SEARCH_DETECTION"))
                            )
                    )
            );
            Map map = client.classifyImage(payload, key);
            Map safeSearchAnnotationsMap = (Map) ((Map) ((List) map.get("responses")).get(0)).get("safeSearchAnnotation");
            isImageExplicit = safeSearchAnnotationsMap.entrySet().stream()
                    .filter((Predicate<Map.Entry<String, String>>) filterEntry -> {
                        String k = filterEntry.getKey();
                        return k.equals("adult") || k.equals("violence") || k.equals("racy");
                    })
                    .anyMatch((Predicate<Map.Entry<String, String>>) matchEntry -> {
                        String v = matchEntry.getValue();
                        return v.equals("LIKELY") || v.equals("VERY_LIKELY");
                    });
        } catch (Exception e) {
            e.printStackTrace();
        }

        return isImageExplicit;
    }
}

//    const detectExplicitContent = async (imageUrl, apiKey) => {
//    const apiEndpoint = "https://vision.googleapis.com/v1/images:annotate";
//    const base64Content = imageUrl.split(",")[1];
//
//    const requestBody = {
//      requests: [
//        {
//          image: {
//            content: base64Content,
//          },
//          features: [
//            {
//              type: "SAFE_SEARCH_DETECTION",
//            },
//          ],
//        },
//      ],
//    };
//
//    try {
//      const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
//        method: "POST",
//        body: JSON.stringify(requestBody),
//        headers: {
//          "Content-Type": "application/json",
//        },
//      });
//
//      if (!response.ok) {
//        throw new Error(`HTTP error: ${response.status}`);
//      }
//
//      const result = await response.json();
//      const safeSearch = result.responses[0].safeSearchAnnotation;
//
//      const explicitLevels = ["LIKELY", "VERY_LIKELY"];
//      const isExplicit =
//        explicitLevels.includes(safeSearch.adult) ||
//        explicitLevels.includes(safeSearch.violence) ||
//        explicitLevels.includes(safeSearch.racy);
//
//      return isExplicit;
//    } catch (error) {
//      console.error("Error:", error);
//    }
//  };