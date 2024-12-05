package be.pxl.services.client;

import be.pxl.services.api.dto.ReviewResponse;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PostClient {

    private final RabbitTemplate rabbitTemplate;

    @Autowired
    public PostClient(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendReviewResult(ReviewResponse reviewResponse) {
        rabbitTemplate.convertAndSend("postQueue", reviewResponse);
    }
}
